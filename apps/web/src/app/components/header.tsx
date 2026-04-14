"use client";

import { Wifi, WifiOff, Loader2, Inbox } from "lucide-react";
import type { ConnectionStatus } from "../../lib/use-signaling";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  receivedCount?: number;
  onReceivedClick?: () => void;
}

export function Header({ connectionStatus, receivedCount = 0, onReceivedClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      {/* Logo */}
      <span className="text-[28px] leading-none tracking-tight">
        <span className="font-medium text-[#1c1c1c]">OTO</span>
        <span className="font-extralight text-[#aaaaaa]">Drop</span>
      </span>

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
              <WifiOff className="w-3.5 h-3.5 text-[#999]" />
              <span className="text-[#999]">Offline</span>
            </>
          )}
        </div>

        {/* Inbox */}
        <button
          onClick={onReceivedClick}
          className="relative w-8 h-8 flex items-center justify-center"
          aria-label="Received files"
        >
          <Inbox className="w-5 h-5 text-[#1c1c1c]" />
          {receivedCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1c1c1c] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {receivedCount > 9 ? "9+" : receivedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
