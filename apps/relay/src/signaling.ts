import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import type { SignalMessage, DeviceInfo } from "@oto/protocol";

interface ConnectedDevice {
  ws: WebSocket;
  device: DeviceInfo;
  roomId?: string;
}

const devices = new Map<string, ConnectedDevice>();
const pins = new Map<string, string>();
const rooms = new Map<string, Set<string>>();

function sendTo(deviceId: string, message: SignalMessage) {
  const conn = devices.get(deviceId);
  if (conn?.ws.readyState === 1) {
    conn.ws.send(JSON.stringify(message));
  }
}

function broadcast(targetIds: string[], message: SignalMessage, exclude?: string) {
  const data = JSON.stringify(message);
  for (const id of targetIds) {
    if (id === exclude) continue;
    const conn = devices.get(id);
    if (conn?.ws.readyState === 1) {
      conn.ws.send(data);
    }
  }
}

function removeFromRooms(deviceId: string) {
  for (const [roomId, members] of rooms) {
    if (members.has(deviceId)) {
      members.delete(deviceId);
      broadcast(
        Array.from(members),
        { type: "room-leave", roomId, deviceId }
      );
      if (members.size === 0) rooms.delete(roomId);
    }
  }
}

// Extract the target device ID from a session ID formatted as "senderId-receiverId-timestamp"
function parseSessionPeers(sessionId: string, senderId: string): { receiverId: string } | null {
  const parts = sessionId.split("-");
  // UUID has 5 segments joined by '-', so two UUIDs = 10 segments + timestamp
  // Just find the other peer by removing the sender
  if (parts.length >= 11) {
    const first = parts.slice(0, 5).join("-");
    const second = parts.slice(5, 10).join("-");
    const receiverId = first === senderId ? second : first;
    return { receiverId };
  }
  return null;
}

export async function signaling(app: FastifyInstance) {
  // Server-side liveness: ping all clients every 30s, drop unresponsive ones
  const aliveSet = new WeakSet<WebSocket>();
  setInterval(() => {
    for (const [id, conn] of devices) {
      if (!aliveSet.has(conn.ws)) {
        // Didn't respond to last ping — terminate
        conn.ws.terminate();
        devices.delete(id);
        broadcast(Array.from(devices.keys()), { type: "device-bye", deviceId: id });
        continue;
      }
      aliveSet.delete(conn.ws);
      if (conn.ws.readyState === 1) conn.ws.ping();
    }
  }, 30000);

  app.get("/ws", { websocket: true }, (socket) => {
    let currentDeviceId: string | null = null;

    socket.on("pong", () => {
      aliveSet.add(socket);
    });
    // Mark alive on connect
    aliveSet.add(socket);

    socket.on("message", (raw) => {
      const text = raw.toString();

      // Keepalive ping from client — reply with pong, nothing more
      if (text === "ping") {
        aliveSet.add(socket);
        socket.send("pong");
        return;
      }

      let msg: SignalMessage;
      try {
        msg = JSON.parse(text);
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      switch (msg.type) {
        case "device-hello": {
          currentDeviceId = msg.device.id;
          devices.set(msg.device.id, { ws: socket, device: msg.device });

          // Send ALL existing devices to the new joiner
          for (const [id, conn] of devices) {
            if (id === msg.device.id) continue;
            socket.send(
              JSON.stringify({
                type: "device-hello",
                device: conn.device,
              } satisfies SignalMessage)
            );
          }

          // Notify all others about the new joiner
          const allDeviceIds = Array.from(devices.keys());
          broadcast(allDeviceIds, msg, msg.device.id);
          break;
        }

        case "device-bye": {
          if (currentDeviceId) {
            removeFromRooms(currentDeviceId);
            devices.delete(currentDeviceId);
          }
          break;
        }

        case "pin-join": {
          const existingDeviceId = pins.get(msg.pin);
          if (existingDeviceId && existingDeviceId !== msg.device.id) {
            const peer = devices.get(existingDeviceId);
            if (peer) {
              const sessionId = `${existingDeviceId}-${msg.device.id}-${Date.now()}`;
              peer.ws.send(
                JSON.stringify({ type: "pin-match", sessionId, peer: msg.device } satisfies SignalMessage)
              );
              socket.send(
                JSON.stringify({ type: "pin-match", sessionId, peer: peer.device } satisfies SignalMessage)
              );
              pins.delete(msg.pin);
            }
          } else {
            pins.set(msg.pin, msg.device.id);
          }
          break;
        }

        case "room-join": {
          if (!rooms.has(msg.roomId)) {
            rooms.set(msg.roomId, new Set());
          }
          rooms.get(msg.roomId)!.add(msg.device.id);
          const conn = devices.get(msg.device.id);
          if (conn) conn.roomId = msg.roomId;

          const memberIds = Array.from(rooms.get(msg.roomId)!);
          const memberDevices = memberIds
            .map((id) => devices.get(id)?.device)
            .filter(Boolean) as DeviceInfo[];

          socket.send(
            JSON.stringify({ type: "room-devices", roomId: msg.roomId, devices: memberDevices } satisfies SignalMessage)
          );
          broadcast(memberIds, msg, msg.device.id);
          break;
        }

        case "room-leave": {
          const room = rooms.get(msg.roomId);
          if (room) {
            room.delete(msg.deviceId);
            broadcast(Array.from(room), msg);
            if (room.size === 0) rooms.delete(msg.roomId);
          }
          break;
        }

        // Targeted: session-offer has receiverId, send only to that device
        case "session-offer": {
          const targetId = msg.offer.receiverId;
          if (targetId) {
            sendTo(targetId, msg);
          }
          break;
        }

        // session-response: route back to the sender (parsed from sessionId)
        case "session-response": {
          const peers = parseSessionPeers(msg.response.sessionId, msg.response.receiverId);
          if (peers) {
            sendTo(peers.receiverId, msg);
          }
          break;
        }

        // RTC signaling: route to the other peer in the session
        case "rtc-offer":
        case "rtc-answer":
        case "rtc-ice": {
          if (currentDeviceId) {
            const peers = parseSessionPeers(msg.sessionId, currentDeviceId);
            if (peers) {
              sendTo(peers.receiverId, msg);
            }
          }
          break;
        }

        case "chunk-ack":
        case "transfer-complete": {
          const allIds = Array.from(devices.keys());
          broadcast(allIds, msg, currentDeviceId ?? undefined);
          break;
        }
      }
    });

    socket.on("close", () => {
      if (currentDeviceId) {
        removeFromRooms(currentDeviceId);
        devices.delete(currentDeviceId);
        broadcast(
          Array.from(devices.keys()),
          { type: "device-bye", deviceId: currentDeviceId }
        );

        for (const [pin, id] of pins) {
          if (id === currentDeviceId) pins.delete(pin);
        }
      }
    });
  });
}
