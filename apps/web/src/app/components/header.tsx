"use client";

import { Wifi, WifiOff, Loader2, Inbox, Menu } from "lucide-react";
import type { ConnectionStatus } from "../../lib/use-signaling";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  receivedCount?: number;
  onReceivedClick?: () => void;
  onMenuClick?: () => void;
}

export function Header({ connectionStatus, receivedCount = 0, onReceivedClick, onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ color: "var(--c-text)" }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-[28px] leading-none tracking-tight italic">
          <span style={{ fontWeight: 500 }}>OTO</span>
          <span style={{ fontWeight: 100, color: "var(--c-text-secondary)" }}>Send</span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 text-xs">
          {connectionStatus === "connected" ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">Connected</span>
            </>
          ) : connectionStatus === "connecting" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span className="text-amber-500">Connecting...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" style={{ color: "var(--c-text-muted)" }} />
              <span style={{ color: "var(--c-text-muted)" }}>Offline</span>
            </>
          )}
        </div>

        {/* Inbox */}
        <button
          onClick={onReceivedClick}
          className="relative w-8 h-8 flex items-center justify-center"
          aria-label="Received files"
        >
          <Inbox className="w-6 h-6" style={{ color: "var(--c-text)" }} />
          {receivedCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--c-accent)", color: "var(--c-on-accent)" }}
            >
              {receivedCount > 9 ? "9+" : receivedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
