export type Platform = "android" | "ios" | "windows" | "mac" | "linux" | "browser";

// Portable WebRTC types so this package compiles without DOM lib
export interface RTCSessionDescriptionLike {
  type?: string;
  sdp?: string;
  [key: string]: unknown;
}
export interface RTCIceCandidateLike {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  [key: string]: unknown;
}

export type TransferStatus =
  | "pending"
  | "transferring"
  | "complete"
  | "failed"
  | "queued"
  | "paused";

export type TransferDirection = "sent" | "received";
export type TransferMode = "local" | "relay";
export type RoomRole = "sender" | "receiver" | "both";

export interface DeviceInfo {
  id: string;
  name: string;
  otterName: string;
  publicKey: string;
  platform: Platform;
  avatarColor: string;
}

export interface SessionOffer {
  sessionId: string;
  senderId: string;
  receiverId: string;
  files: FileMetadata[];
  encrypted: boolean;
  timestamp: number;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  checksum?: string;
}

export interface SessionResponse {
  sessionId: string;
  accepted: boolean;
  receiverId: string;
}

export interface ChunkData {
  sessionId: string;
  fileId: string;
  index: number;
  totalChunks: number;
  data: Uint8Array;
  iv?: Uint8Array;
}

export interface ChunkAck {
  sessionId: string;
  fileId: string;
  index: number;
  bytesReceived: number;
}

export interface TransferComplete {
  sessionId: string;
  fileId: string;
  checksum: string;
  verified: boolean;
}

export type SignalMessage =
  | { type: "device-hello"; device: DeviceInfo }
  | { type: "device-bye"; deviceId: string }
  | { type: "session-offer"; offer: SessionOffer }
  | { type: "session-response"; response: SessionResponse }
  | { type: "rtc-offer"; sessionId: string; sdp: RTCSessionDescriptionLike }
  | { type: "rtc-answer"; sessionId: string; sdp: RTCSessionDescriptionLike }
  | { type: "rtc-ice"; sessionId: string; candidate: RTCIceCandidateLike }
  | { type: "chunk-ack"; ack: ChunkAck }
  | { type: "transfer-complete"; complete: TransferComplete }
  | { type: "room-join"; roomId: string; device: DeviceInfo }
  | { type: "room-leave"; roomId: string; deviceId: string }
  | { type: "room-devices"; roomId: string; devices: DeviceInfo[] }
  | { type: "pin-join"; pin: string; device: DeviceInfo }
  | { type: "pin-match"; sessionId: string; peer: DeviceInfo }
  | { type: "error"; message: string };
