import type { SignalMessage, DeviceInfo } from "@oto/protocol";

type MessageHandler = (msg: SignalMessage) => void;
type StatusHandler = (status: "connecting" | "connected" | "disconnected") => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();
  private statusHandlers = new Set<StatusHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private pongTimeout: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;
  private _status: "connecting" | "connected" | "disconnected" = "disconnected";
  private destroyed = false;
  private retryDelay = 1000;

  constructor(
    private url: string,
    private device: DeviceInfo
  ) {}

  get connected() {
    return this._connected;
  }

  get status() {
    return this._status;
  }

  private setStatus(s: "connecting" | "connected" | "disconnected") {
    this._status = s;
    this._connected = s === "connected";
    this.statusHandlers.forEach((h) => h(s));
  }

  connect() {
    if (this.destroyed) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    // Close any lingering sockets in CONNECTING state
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }

    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.setStatus("disconnected");
      this.scheduleReconnect();
      return;
    }

    // Hard timeout: if socket doesn't open in 10s, kill and retry
    const connectTimeout = setTimeout(() => {
      if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
        console.warn("[WS] connect timeout, retrying");
        try { this.ws.close(); } catch {}
        this.ws = null;
        this.setStatus("disconnected");
        this.scheduleReconnect();
      }
    }, 10000);

    this.ws.onopen = () => {
      clearTimeout(connectTimeout);
      this.setStatus("connected");
      this.retryDelay = 1000;
      this.send({ type: "device-hello", device: this.device });
      this.startPing();
    };

    this.ws.onmessage = (event) => {
      if (event.data === "pong") {
        if (this.pongTimeout) {
          clearTimeout(this.pongTimeout);
          this.pongTimeout = null;
        }
        return;
      }
      try {
        const msg: SignalMessage = JSON.parse(event.data);
        this.handlers.forEach((h) => h(msg));
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      clearTimeout(connectTimeout);
      this.setStatus("disconnected");
      this.stopPing();
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose will fire after this
    };
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
        // If no pong within 5s, consider connection dead
        this.pongTimeout = setTimeout(() => {
          console.warn("[WS] pong timeout, reconnecting");
          try { this.ws?.close(); } catch {}
        }, 5000);
      }
    }, 20000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 1.5, 10000);
  }

  forceReconnect() {
    if (this.destroyed) return;
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Already connected, just re-announce
      this.send({ type: "device-hello", device: this.device });
      return;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.retryDelay = 1000;
    this.connect();
  }

  send(msg: SignalMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  disconnect() {
    this.destroyed = true;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.send({ type: "device-bye", deviceId: this.device.id });
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("disconnected");
  }
}
