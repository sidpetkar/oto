"use client";

import { useState } from "react";
import { X, Copy, Check, QrCode, Keyboard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface PinDialogProps {
  mode: "create" | "join";
  pin?: string;
  onJoin?: (pin: string) => void;
  onClose: () => void;
}

function getShareUrl(pin: string): string {
  if (typeof window === "undefined") return "";
  const base = window.location.origin;
  return `${base}?pin=${pin}`;
}

export function PinDialog({ mode, pin, onJoin, onClose }: PinDialogProps) {
  const [inputPin, setInputPin] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(mode === "create");

  const handleCopy = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = pin ? getShareUrl(pin) : "";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6">
        <div className="w-10 h-1 bg-[#e0e0e0] rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-lg">
            {mode === "create" ? "Share Connection" : "Join Device"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === "create" && pin ? (
          <div className="text-center mb-6">
            {showQr ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-2xl border-2 border-[#f0f0f0] inline-block">
                    <QRCodeSVG
                      value={shareUrl}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#1c1c1c"
                      level="M"
                    />
                  </div>
                </div>
                <p className="text-sm text-[#999] mb-1">Scan with any camera app</p>
                <p className="text-xs text-[#ccc] mb-4">or share PIN: <span className="font-bold text-[#1c1c1c] tracking-widest">{pin}</span></p>
              </>
            ) : (
              <>
                <p className="text-5xl font-bold tracking-[0.3em] mb-4">{pin}</p>
                <p className="text-sm text-[#999] mb-4">Share this PIN with the other device</p>
              </>
            )}

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl bg-[#f0f0f0] text-sm hover:bg-[#e0e0e0] transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy PIN"}
              </button>
              <button
                onClick={() => setShowQr(!showQr)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl bg-[#f0f0f0] text-sm hover:bg-[#e0e0e0] transition-colors"
              >
                {showQr ? <Keyboard className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                {showQr ? "Show PIN" : "Show QR"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-4xl font-bold tracking-[0.3em] py-4 border-2 border-[#e0e0e0] rounded-3xl focus:border-[#1c1c1c] focus:outline-none transition-colors"
            />
          </div>
        )}

        {mode === "join" && (
          <button
            onClick={() => onJoin?.(inputPin)}
            disabled={inputPin.length !== 6}
            className="w-full py-3.5 rounded-3xl bg-[#1c1c1c] text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
          >
            Connect
          </button>
        )}

        {mode === "create" && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#999]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Waiting for connection...
          </div>
        )}
      </div>
    </div>
  );
}
