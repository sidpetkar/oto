"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { DeviceInfo, SignalMessage } from "@oto/protocol";
import { SignalingClient } from "./signaling";
import { getOrCreateDevice } from "./device";

const RELAY_URL =
  process.env.NEXT_PUBLIC_RELAY_URL || "ws://localhost:4000/ws";

export function useSignaling() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [peers, setPeers] = useState<DeviceInfo[]>([]);
  const [connected, setConnected] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [matchedPeer, setMatchedPeer] = useState<{
    sessionId: string;
    peer: DeviceInfo;
  } | null>(null);

  const clientRef = useRef<SignalingClient | null>(null);

  // Create device identity on client only (avoids hydration mismatch)
  useEffect(() => {
    setDevice(getOrCreateDevice());
  }, []);

  // Connect to relay once device is ready
  useEffect(() => {
    if (!device) return;

    const client = new SignalingClient(RELAY_URL, device);
    clientRef.current = client;

    const unsub = client.onMessage((msg: SignalMessage) => {
      switch (msg.type) {
        case "device-hello":
          setPeers((prev) => {
            if (msg.device.id === device.id) return prev;
            if (prev.find((p) => p.id === msg.device.id)) return prev;
            return [...prev, msg.device];
          });
          break;
        case "device-bye":
          setPeers((prev) => prev.filter((p) => p.id !== msg.deviceId));
          break;
        case "pin-match":
          setMatchedPeer({ sessionId: msg.sessionId, peer: msg.peer });
          break;
        case "room-devices":
          setPeers(msg.devices.filter((d) => d.id !== device.id));
          break;
        case "room-join":
          setPeers((prev) => {
            if (msg.device.id === device.id) return prev;
            if (prev.find((p) => p.id === msg.device.id)) return prev;
            return [...prev, msg.device];
          });
          break;
        case "room-leave":
          setPeers((prev) => prev.filter((p) => p.id !== msg.deviceId));
          break;
      }
    });

    client.connect();

    const interval = setInterval(() => {
      setConnected(client.connected);
    }, 500);

    return () => {
      unsub();
      clearInterval(interval);
      client.disconnect();
      clientRef.current = null;
    };
  }, [device]);

  const createPin = useCallback(() => {
    if (!device) return "";
    const p = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(p);
    clientRef.current?.send({
      type: "pin-join",
      pin: p,
      device,
    });
    return p;
  }, [device]);

  const joinPin = useCallback(
    (p: string) => {
      if (!device) return;
      setPin(p);
      clientRef.current?.send({
        type: "pin-join",
        pin: p,
        device,
      });
    },
    [device]
  );

  const clearMatch = useCallback(() => {
    setMatchedPeer(null);
  }, []);

  return {
    device,
    peers,
    connected,
    pin,
    matchedPeer,
    createPin,
    joinPin,
    clearMatch,
    client: clientRef,
  };
}
