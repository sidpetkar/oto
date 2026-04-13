"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

interface PinDialogProps {
  mode: "create" | "join";
  pin?: string;
  onJoin?: (pin: string) => void;
  onClose: () => void;
}

export function PinDialog({ mode, pin, onJoin, onClose }: PinDialogProps) {
  const [inputPin, setInputPin] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-lg">
            {mode === "create" ? "Your PIN" : "Enter PIN"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === "create" && pin ? (
          <div className="text-center mb-6">
            <p className="text-5xl font-bold tracking-[0.3em] mb-4">{pin}</p>
            <p className="text-sm text-[#999] mb-4">
              Share this PIN with the other device
            </p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f0f0f0] text-sm hover:bg-[#e0e0e0] transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy PIN"}
            </button>
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
              className="w-full text-center text-4xl font-bold tracking-[0.3em] py-4 border-2 border-[#e0e0e0] rounded-2xl focus:border-[#1c1c1c] focus:outline-none transition-colors"
            />
          </div>
        )}

        {mode === "join" && (
          <button
            onClick={() => onJoin?.(inputPin)}
            disabled={inputPin.length !== 6}
            className="w-full py-3.5 rounded-2xl bg-[#1c1c1c] text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
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
