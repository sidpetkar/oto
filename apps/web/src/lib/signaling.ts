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
  private lastPongAt = 0;
  private _connected = false;
  private _status: "connecting" | "connected" | "disconnected" = "disconnected";
  private destroyed = false;
  private retryDelay = 500;
  private burstAttempts = 0;

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

  private killSocket() {
    this.stopPing();
    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }

  connect() {
    if (this.destroyed) return;

    // Always kill existing socket — iOS reports stale sockets as OPEN after resume
    this.killSocket();
    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.setStatus("disconnected");
      this.scheduleReconnect();
      return;
    }

    const connectTimeout = setTimeout(() => {
      if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
        console.warn("[WS] connect timeout, retrying");
        this.killSocket();
        this.setStatus("disconnected");
        this.scheduleReconnect();
      }
    }, 8000);

    this.ws.onopen = () => {
      clearTimeout(connectTimeout);
      this.setStatus("connected");
      this.retryDelay = 500;
      this.burstAttempts = 0;
      this.lastPongAt = Date.now();
      this.send({ type: "device-hello", device: this.device });
      this.startPing();
    };

    this.ws.onmessage = (event) => {
      if (event.data === "pong") {
        this.lastPongAt = Date.now();
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
        // ignore malformed
      }
    };

    this.ws.onclose = () => {
      clearTimeout(connectTimeout);
      this.setStatus("disconnected");
      this.stopPing();
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose fires after this
    };
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      // Check if socket is truly alive — iOS can keep readyState=OPEN on dead sockets
      const sincePong = Date.now() - this.lastPongAt;
      if (sincePong > 30000) {
        console.warn("[WS] no pong in 30s, forcing reconnect");
        this.killSocket();
        this.setStatus("disconnected");
        this.scheduleReconnect();
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send("ping");
        } catch {
          this.killSocket();
          this.setStatus("disconnected");
          this.scheduleReconnect();
          return;
        }
        this.pongTimeout = setTimeout(() => {
          console.warn("[WS] pong timeout, reconnecting");
          this.killSocket();
          this.setStatus("disconnected");
          this.scheduleReconnect();
        }, 3000);
      }
    }, 12000);
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
    // Burst: first 4 attempts are fast (500ms, 700ms, 1000ms, 1500ms), then back off
    if (this.burstAttempts < 4) {
      this.burstAttempts++;
      this.retryDelay = Math.min(this.retryDelay * 1.4, 1500);
    } else {
      this.retryDelay = Math.min(this.retryDelay * 1.5, 8000);
    }
  }

  /**
   * Force reconnect — called on visibility change / online event.
   * Always kills old socket (iOS lies about socket state after resume).
   */
  forceReconnect() {
    if (this.destroyed) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.retryDelay = 500;
    this.burstAttempts = 0;
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
