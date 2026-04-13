import type { FileMetadata } from "@oto/protocol";
import { splitFileStream, sha256Hex } from "@oto/core";
import type { SignalingClient } from "./signaling";

const CHUNK_SIZE = 64 * 1024;

export type TransferProgress = {
  fileId: string;
  fileName: string;
  progress: number;
  speed: number;
  status: "waiting" | "transferring" | "complete" | "failed";
};

type ProgressCallback = (transfers: TransferProgress[]) => void;

export class WebRTCPeer {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private signaling: SignalingClient;
  private sessionId: string;
  private isInitiator: boolean;
  private onProgressUpdate: ProgressCallback;
  private transfers: Map<string, TransferProgress> = new Map();
  private receiveBuffers: Map<string, Uint8Array[]> = new Map();
  private receiveMeta: Map<string, FileMetadata> = new Map();
  private receiveStartTimes: Map<string, number> = new Map();
  private onFileReceived: (file: Blob, meta: FileMetadata) => void;
  private cleanup: (() => void) | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private remoteDescSet = false;

  constructor(opts: {
    signaling: SignalingClient;
    sessionId: string;
    isInitiator: boolean;
    onProgress: ProgressCallback;
    onFileReceived: (file: Blob, meta: FileMetadata) => void;
  }) {
    this.signaling = opts.signaling;
    this.sessionId = opts.sessionId;
    this.isInitiator = opts.isInitiator;
    this.onProgressUpdate = opts.onProgress;
    this.onFileReceived = opts.onFileReceived;
  }

  /** Call after both sides are ready. Initiator creates offer, receiver waits for it. */
  start() {
    this.createConnection();
    this.setupSignalingListener();
  }

  private emitProgress() {
    this.onProgressUpdate(Array.from(this.transfers.values()));
  }

  private setupSignalingListener() {
    this.cleanup = this.signaling.onMessage((msg) => {
      if (msg.type === "rtc-answer" && msg.sessionId === this.sessionId) {
        this.handleAnswer(msg.sdp as RTCSessionDescriptionInit);
      }
      if (msg.type === "rtc-offer" && msg.sessionId === this.sessionId) {
        this.handleOffer(msg.sdp as RTCSessionDescriptionInit);
      }
      if (msg.type === "rtc-ice" && msg.sessionId === this.sessionId) {
        this.addIceCandidate(msg.candidate as RTCIceCandidateInit);
      }
    });
  }

  private createConnection() {
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.signaling.send({
          type: "rtc-ice",
          sessionId: this.sessionId,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      console.log(`[RTC:${this.sessionId.slice(0, 6)}] ${this.pc?.connectionState}`);
    };

    if (this.isInitiator) {
      this.dc = this.pc.createDataChannel("transfer", { ordered: true });
      this.setupDataChannel(this.dc);
      this.makeOffer();
    } else {
      this.pc.ondatachannel = (e) => {
        this.dc = e.channel;
        this.setupDataChannel(this.dc);
      };
    }
  }

  private setupDataChannel(dc: RTCDataChannel) {
    dc.binaryType = "arraybuffer";
    dc.onopen = () => console.log(`[RTC:${this.sessionId.slice(0, 6)}] channel open`);
    dc.onmessage = (event) => {
      if (typeof event.data === "string") {
        this.handleControlMessage(JSON.parse(event.data));
      } else {
        this.handleBinaryData(new Uint8Array(event.data));
      }
    };
    dc.onerror = () => {
      // Peer likely disconnected — not actionable, suppress
    };
    dc.onclose = () => {
      console.log(`[RTC:${this.sessionId.slice(0, 6)}] channel closed`);
    };
  }

  private currentReceiveFileId: string | null = null;

  private handleControlMessage(msg: Record<string, unknown>) {
    if (msg.type === "file-start") {
      const meta = msg.file as FileMetadata;
      this.receiveMeta.set(meta.id, meta);
      this.receiveBuffers.set(meta.id, []);
      this.receiveStartTimes.set(meta.id, Date.now());
      this.currentReceiveFileId = meta.id;
      this.transfers.set(meta.id, {
        fileId: meta.id,
        fileName: meta.name,
        progress: 0,
        speed: 0,
        status: "transferring",
      });
      this.emitProgress();
    }

    if (msg.type === "file-end") {
      const fileId = msg.fileId as string;
      const chunks = this.receiveBuffers.get(fileId);
      const meta = this.receiveMeta.get(fileId);
      if (chunks && meta) {
        const blob = new Blob(chunks);
        this.transfers.set(fileId, {
          fileId,
          fileName: meta.name,
          progress: 100,
          speed: 0,
          status: "complete",
        });
        this.emitProgress();
        this.onFileReceived(blob, meta);
        this.receiveBuffers.delete(fileId);
        this.receiveMeta.delete(fileId);
        this.receiveStartTimes.delete(fileId);
      }
      this.currentReceiveFileId = null;
    }
  }

  private handleBinaryData(data: Uint8Array) {
    const fileId = this.currentReceiveFileId;
    if (!fileId) return;

    const chunks = this.receiveBuffers.get(fileId);
    const meta = this.receiveMeta.get(fileId);
    if (!chunks || !meta) return;

    chunks.push(data);
    const received = chunks.reduce((sum, c) => sum + c.length, 0);
    const progress = (received / meta.size) * 100;
    const startTime = this.receiveStartTimes.get(fileId) ?? Date.now();
    const elapsed = (Date.now() - startTime) / 1000;
    const speed = elapsed > 0 ? received / elapsed : 0;

    this.transfers.set(fileId, {
      fileId,
      fileName: meta.name,
      progress,
      speed,
      status: "transferring",
    });
    this.emitProgress();
  }

  private async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.remoteDescSet && this.pc) {
      await this.pc.addIceCandidate(candidate);
    } else {
      this.pendingCandidates.push(candidate);
    }
  }

  private async flushCandidates() {
    this.remoteDescSet = true;
    for (const c of this.pendingCandidates) {
      await this.pc?.addIceCandidate(c);
    }
    this.pendingCandidates = [];
  }

  private async makeOffer() {
    if (!this.pc) return;
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.signaling.send({
      type: "rtc-offer",
      sessionId: this.sessionId,
      sdp: offer,
    });
  }

  private async handleOffer(sdp: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(sdp);
    await this.flushCandidates();
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.signaling.send({
      type: "rtc-answer",
      sessionId: this.sessionId,
      sdp: answer,
    });
  }

  private async handleAnswer(sdp: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(sdp);
    await this.flushCandidates();
  }

  async sendFiles(files: File[]) {
    await new Promise<void>((resolve, reject) => {
      if (this.dc?.readyState === "open") { resolve(); return; }
      const timeout = setTimeout(() => reject(new Error("Data channel open timeout (30s)")), 30000);
      const check = () => {
        if (this.dc?.readyState === "open") { clearTimeout(timeout); resolve(); }
        else if (this.dc?.readyState === "closed") { clearTimeout(timeout); reject(new Error("Channel closed")); }
        else setTimeout(check, 50);
      };
      check();
    });

    for (const file of files) {
      const fileId = crypto.randomUUID();
      const meta: FileMetadata = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      };

      this.transfers.set(fileId, { fileId, fileName: file.name, progress: 0, speed: 0, status: "transferring" });
      this.emitProgress();

      this.dc!.send(JSON.stringify({ type: "file-start", file: meta }));

      const startTime = Date.now();
      let bytesSent = 0;

      for await (const chunk of splitFileStream(file, CHUNK_SIZE)) {
        while (this.dc!.bufferedAmount > 1024 * 1024) {
          await new Promise((r) => setTimeout(r, 10));
        }
        this.dc!.send(chunk.data);
        bytesSent += chunk.data.length;

        const elapsed = (Date.now() - startTime) / 1000;
        this.transfers.set(fileId, {
          fileId,
          fileName: file.name,
          progress: (bytesSent / file.size) * 100,
          speed: elapsed > 0 ? bytesSent / elapsed : 0,
          status: "transferring",
        });
        this.emitProgress();
      }

      const checksum = await sha256Hex(await file.arrayBuffer());
      this.dc!.send(JSON.stringify({ type: "file-end", fileId, checksum }));

      this.transfers.set(fileId, { fileId, fileName: file.name, progress: 100, speed: 0, status: "complete" });
      this.emitProgress();
    }
  }

  destroy() {
    this.cleanup?.();
    this.dc?.close();
    this.pc?.close();
    this.pc = null;
    this.dc = null;
  }
}
