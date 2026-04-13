"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { DeviceInfo, FileMetadata } from "@oto/protocol";
import { useSignaling } from "../lib/use-signaling";
import { WebRTCPeer, type TransferProgress as TProgress } from "../lib/webrtc";
import { Header } from "./components/header";
import { Radar } from "./components/radar";
import { SendModal } from "./components/send-modal";
import { ReceivePrompt } from "./components/receive-prompt";
import { TransferProgress } from "./components/transfer-progress";
import { PinDialog } from "./components/pin-dialog";
import { ReceivedFiles, type ReceivedFile } from "./components/received-files";

export default function AppClient() {
  const { device, peers, connected, pin, matchedPeer, createPin, joinPin, clearMatch, client } =
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

  const peerRef = useRef<WebRTCPeer | null>(null);
  const peersRef = useRef<DeviceInfo[]>([]);
  peersRef.current = peers;

  // Pending files for the sender to send after receiver accepts
  const pendingFilesRef = useRef<File[]>([]);

  // Listen for incoming session offers + session responses
  useEffect(() => {
    if (!client.current || !device) return;

    const unsub = client.current.onMessage((msg) => {
      // Receiver gets a session-offer
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

      // Sender gets a session-response (accepted or rejected)
      if (msg.type === "session-response") {
        if (msg.response.accepted) {
          // Receiver accepted — now start WebRTC as initiator
          const rtc = new WebRTCPeer({
            signaling: client.current!,
            sessionId: msg.response.sessionId,
            isInitiator: true,
            onProgress: (t) => setTransfers([...t]),
            onFileReceived: () => {},
          });
          rtc.start();
          peerRef.current = rtc;

          // Send the pending files
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

      // Stash files — we'll send them when the receiver accepts
      pendingFilesRef.current = files;

      // Send session offer to the specific receiver
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

      // Set a "waiting" state for the transfers
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

    // Create WebRTC peer as receiver FIRST, then send acceptance
    const rtc = new WebRTCPeer({
      signaling: client.current,
      sessionId: incomingOffer.sessionId,
      isInitiator: false,
      onProgress: (t) => setTransfers([...t]),
      onFileReceived: (blob, meta) => {
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [
          {
            id: meta.id,
            name: meta.name,
            size: meta.size,
            type: meta.type,
            url,
            timestamp: Date.now(),
            from: incomingOffer.sender.otterName,
          },
          ...prev,
        ]);
      },
    });
    rtc.start();
    peerRef.current = rtc;

    // Now tell the sender we accepted — they'll create their WebRTC + send RTC offer
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

  const handleCloseTransfers = () => {
    setShowTransfers(false);
    setTransfers([]);
    peerRef.current?.destroy();
    peerRef.current = null;
    // If there are received files, show them
    if (receivedFiles.length > 0) {
      setShowReceived(true);
    }
  };

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="font-bold text-xl tracking-tight">OTODrop</span>
        <p className="text-sm text-[#999] mt-2">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
      <Header
        connected={connected}
        receivedCount={receivedFiles.length}
        onReceivedClick={() => setShowReceived(true)}
      />

      {/* Peer chips */}
      {peers.length > 0 && (
        <div className="flex gap-2 px-5 py-2 overflow-x-auto no-scrollbar">
          {peers.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePeerClick(p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#f0f0f0] text-[#1c1c1c] hover:bg-[#e0e0e0] transition-colors whitespace-nowrap"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.avatarColor }}
              />
              {p.otterName}
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pt-4 pb-2">
        <p className="text-sm text-[#999]">Available Nearby</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-5">
        <Radar self={device} peers={peers} onPeerClick={handlePeerClick} />
      </div>

      <div className="flex gap-3 px-5 py-5">
        <button
          onClick={() => setShowPinJoin(true)}
          className="flex-1 py-3.5 rounded-2xl bg-[#f0f0f0] text-[#1c1c1c] font-medium text-sm hover:bg-[#e0e0e0] transition-colors"
        >
          Receive
        </button>
        <button
          onClick={handleCreatePin}
          className="flex-1 py-3.5 rounded-2xl bg-[#1c1c1c] text-white font-medium text-sm hover:bg-[#333] transition-colors"
        >
          Send
        </button>
      </div>

      {/* Modals */}
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
        <TransferProgress transfers={transfers} onClose={handleCloseTransfers} />
      )}

      {showReceived && (
        <ReceivedFiles
          files={receivedFiles}
          onClose={() => setShowReceived(false)}
          onClear={() => {
            receivedFiles.forEach((f) => URL.revokeObjectURL(f.url));
            setReceivedFiles([]);
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
