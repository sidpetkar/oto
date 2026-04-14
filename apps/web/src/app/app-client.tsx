"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { DeviceInfo, FileMetadata } from "@oto/protocol";
import { useSignaling } from "../lib/use-signaling";
import { WebRTCPeer, type TransferProgress as TProgress } from "../lib/webrtc";
import { saveFile, getAllFiles, clearAllFiles, type StoredFile } from "../lib/file-store";
import { useWakeLock } from "../lib/use-wake-lock";
import { Header } from "./components/header";
import { Radar } from "./components/radar";
import { SendModal } from "./components/send-modal";
import { ReceivePrompt } from "./components/receive-prompt";
import { TransferProgress } from "./components/transfer-progress";
import { PinDialog } from "./components/pin-dialog";
import { ReceivedFiles, type ReceivedFile } from "./components/received-files";

function storedToReceived(s: StoredFile): ReceivedFile {
  return {
    id: s.id,
    name: s.name,
    size: s.size,
    type: s.type,
    url: URL.createObjectURL(s.blob),
    timestamp: s.timestamp,
    from: s.from,
  };
}

export default function AppClient() {
  const { device, peers, connected, connectionStatus, pin, matchedPeer, createPin, joinPin, clearMatch, client } =
    useSignaling();

  const [selectedPeer, setSelectedPeer] = useState<DeviceInfo | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPinCreate, setShowPinCreate] = useState(false);
  const [showPinJoin, setShowPinJoin] = useState(false);
  const [transfers, setTransfers] = useState<TProgress[]>([]);
  const [showTransfers, setShowTransfers] = useState(false);
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [showReceived, setShowReceived] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<{
    sender: DeviceInfo;
    files: FileMetadata[];
    sessionId: string;
  } | null>(null);

  // Keep screen awake while app is connected or transferring
  useWakeLock(connected || showTransfers);

  const peerRef = useRef<WebRTCPeer | null>(null);
  const peersRef = useRef<DeviceInfo[]>([]);
  peersRef.current = peers;

  const pendingFilesRef = useRef<File[]>([]);

  useEffect(() => {
    getAllFiles()
      .then((stored) => {
        if (stored.length > 0) {
          setReceivedFiles(stored.map(storedToReceived));
        }
      })
      .catch(() => {});
  }, []);

  // Auto-join PIN from URL (QR code flow)
  const autoJoinedRef = useRef(false);
  useEffect(() => {
    if (!device || !connected || autoJoinedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const urlPin = params.get("pin");
    if (urlPin && urlPin.length === 6) {
      autoJoinedRef.current = true;
      joinPin(urlPin);
      setShowPinJoin(false);
      // Clean URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [device, connected, joinPin]);

  useEffect(() => {
    if (!client.current || !device) return;

    const unsub = client.current.onMessage((msg) => {
      if (msg.type === "session-offer" && msg.offer.receiverId === device.id) {
        const currentPeers = peersRef.current;
        const sender = currentPeers.find((p) => p.id === msg.offer.senderId);
        const senderInfo: DeviceInfo = sender ?? {
          id: msg.offer.senderId,
          name: "Unknown",
          otterName: "Device",
          publicKey: "",
          platform: "browser",
          avatarColor: "#999",
        };
        setIncomingOffer({
          sender: senderInfo,
          files: msg.offer.files,
          sessionId: msg.offer.sessionId,
        });
      }

      if (msg.type === "session-response") {
        if (msg.response.accepted) {
          const rtc = new WebRTCPeer({
            signaling: client.current!,
            sessionId: msg.response.sessionId,
            isInitiator: true,
            onProgress: (t) => setTransfers([...t]),
            onFileReceived: () => {},
          });
          rtc.start();
          peerRef.current = rtc;

          const files = pendingFilesRef.current;
          pendingFilesRef.current = [];
          rtc.sendFiles(files).catch((err) => {
            console.error("[Transfer] send failed:", err);
          });
        } else {
          setShowTransfers(false);
          setTransfers([]);
        }
      }
    });

    return unsub;
  }, [client, device]);

  const handlePeerClick = (peer: DeviceInfo) => {
    setSelectedPeer(peer);
    setShowSendModal(true);
  };

  const handleSendFiles = useCallback(
    (files: File[]) => {
      if (!selectedPeer || !client.current || !device) return;
      setShowSendModal(false);
      setShowTransfers(true);

      const sessionId = `${device.id}-${selectedPeer.id}-${Date.now()}`;

      pendingFilesRef.current = files;

      client.current.send({
        type: "session-offer",
        offer: {
          sessionId,
          senderId: device.id,
          receiverId: selectedPeer.id,
          files: files.map((f) => ({
            id: crypto.randomUUID(),
            name: f.name,
            size: f.size,
            type: f.type || "application/octet-stream",
          })),
          encrypted: false,
          timestamp: Date.now(),
        },
      });

      setTransfers(
        files.map((f) => ({
          fileId: crypto.randomUUID(),
          fileName: f.name,
          progress: 0,
          speed: 0,
          status: "waiting" as const,
        }))
      );
    },
    [selectedPeer, client, device]
  );

  const handleAcceptTransfer = useCallback(() => {
    if (!incomingOffer || !client.current || !device) return;

    const offerSender = incomingOffer.sender;

    const rtc = new WebRTCPeer({
      signaling: client.current,
      sessionId: incomingOffer.sessionId,
      isInitiator: false,
      onProgress: (t) => setTransfers([...t]),
      onFileReceived: (blob, meta) => {
        const url = URL.createObjectURL(blob);
        const received: ReceivedFile = {
          id: meta.id,
          name: meta.name,
          size: meta.size,
          type: meta.type,
          url,
          timestamp: Date.now(),
          from: offerSender.otterName,
        };
        setReceivedFiles((prev) => [received, ...prev]);

        saveFile({
          id: meta.id,
          name: meta.name,
          size: meta.size,
          type: meta.type,
          blob,
          timestamp: Date.now(),
          from: offerSender.otterName,
        }).catch(() => {});
      },
    });
    rtc.start();
    peerRef.current = rtc;

    client.current.send({
      type: "session-response",
      response: {
        sessionId: incomingOffer.sessionId,
        accepted: true,
        receiverId: device.id,
      },
    });

    setShowTransfers(true);
    setIncomingOffer(null);
  }, [incomingOffer, client, device]);

  const handleRejectTransfer = useCallback(() => {
    if (!incomingOffer || !client.current || !device) return;
    client.current.send({
      type: "session-response",
      response: {
        sessionId: incomingOffer.sessionId,
        accepted: false,
        receiverId: device.id,
      },
    });
    setIncomingOffer(null);
  }, [incomingOffer, client, device]);

  const handleCreatePin = () => {
    createPin();
    setShowPinCreate(true);
  };

  const handleJoinPin = (p: string) => {
    joinPin(p);
    setShowPinJoin(false);
  };

  const handlePinMatchSend = () => {
    if (matchedPeer) {
      setSelectedPeer(matchedPeer.peer);
      setShowSendModal(true);
      setShowPinCreate(false);
      clearMatch();
    }
  };

  const handleCancelTransfer = () => {
    setShowTransfers(false);
    setTransfers([]);
    pendingFilesRef.current = [];
    peerRef.current?.destroy();
    peerRef.current = null;
  };

  const handleCloseTransfers = () => {
    setShowTransfers(false);
    setTransfers([]);
    peerRef.current?.destroy();
    peerRef.current = null;
    if (receivedFiles.length > 0) {
      setShowReceived(true);
    }
  };

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center h-screen overflow-hidden">
        <span className="text-xl tracking-tight italic leading-none">
          <span style={{ fontWeight: 500 }}>OTO</span>
          <span style={{ fontWeight: 100 }} className="text-[#aaaaaa]">Send</span>
        </span>
        <p className="text-sm text-[#999] mt-2">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto w-full overflow-hidden" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <Header
        connectionStatus={connectionStatus}
        receivedCount={receivedFiles.length}
        onReceivedClick={() => setShowReceived(true)}
      />

      <div className="flex-1 flex items-center justify-center px-4">
        <Radar self={device} peers={peers} onPeerClick={handlePeerClick} />
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-6 flex gap-3">
        <button
          onClick={handleCreatePin}
          className="flex-1 py-3 rounded-3xl bg-[#1c1c1c] text-white text-sm hover:bg-[#333] transition-colors"
        >
          Create Drop
        </button>
        <button
          onClick={() => setShowPinJoin(true)}
          className="flex-1 py-3 rounded-3xl bg-[#f0f0f0] text-[#1c1c1c] text-sm hover:bg-[#e0e0e0] transition-colors"
        >
          Join Drop
        </button>
      </div>

      {showSendModal && selectedPeer && (
        <SendModal
          peer={selectedPeer}
          onSend={handleSendFiles}
          onClose={() => setShowSendModal(false)}
        />
      )}

      {incomingOffer && (
        <ReceivePrompt
          sender={incomingOffer.sender}
          files={incomingOffer.files}
          onAccept={handleAcceptTransfer}
          onReject={handleRejectTransfer}
        />
      )}

      {showTransfers && transfers.length > 0 && (
        <TransferProgress
          transfers={transfers}
          onClose={handleCloseTransfers}
          onCancel={handleCancelTransfer}
        />
      )}

      {showReceived && (
        <ReceivedFiles
          files={receivedFiles}
          onClose={() => setShowReceived(false)}
          onClear={() => {
            receivedFiles.forEach((f) => URL.revokeObjectURL(f.url));
            setReceivedFiles([]);
            clearAllFiles().catch(() => {});
            setShowReceived(false);
          }}
        />
      )}

      {showPinCreate && (
        <PinDialog
          mode="create"
          pin={pin ?? undefined}
          onClose={() => {
            if (matchedPeer) handlePinMatchSend();
            else setShowPinCreate(false);
          }}
        />
      )}

      {showPinJoin && (
        <PinDialog
          mode="join"
          onJoin={handleJoinPin}
          onClose={() => setShowPinJoin(false)}
        />
      )}

      {matchedPeer && showPinCreate && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1c1c1c] text-white px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 z-50 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Connected to {matchedPeer.peer.otterName}
          <button
            onClick={handlePinMatchSend}
            className="ml-2 px-3 py-1 bg-white text-[#1c1c1c] rounded-lg text-xs font-medium"
          >
            Send Files
          </button>
        </div>
      )}
    </div>
  );
}
