"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { DeviceInfo, SignalMessage } from "@oto/protocol";
import { SignalingClient } from "./signaling";
import { getOrCreateDevice } from "./device";

const RELAY_URL =
  process.env.NEXT_PUBLIC_RELAY_URL || "ws://localhost:4000/ws";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function useSignaling() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [peers, setPeers] = useState<DeviceInfo[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [pin, setPin] = useState<string | null>(null);
  const [matchedPeer, setMatchedPeer] = useState<{
    sessionId: string;
    peer: DeviceInfo;
  } | null>(null);

  const clientRef = useRef<SignalingClient | null>(null);

  useEffect(() => {
    setDevice(getOrCreateDevice());
  }, []);

  useEffect(() => {
    if (!device) return;

    const client = new SignalingClient(RELAY_URL, device);
    clientRef.current = client;

    const unsubStatus = client.onStatus((s) => setConnectionStatus(s));

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

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        client.forceReconnect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleOnline = () => client.forceReconnect();
    window.addEventListener("online", handleOnline);

    return () => {
      unsub();
      unsubStatus();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
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
    connected: connectionStatus === "connected",
    connectionStatus,
    pin,
    matchedPeer,
    createPin,
    joinPin,
    clearMatch,
    client: clientRef,
  };
}
