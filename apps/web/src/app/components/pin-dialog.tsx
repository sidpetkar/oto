"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useModalAnimation } from "../../lib/use-modal-animation";

interface PinDialogProps {
  mode: "create" | "join";
  pin?: string;
  onJoin?: (pin: string) => void;
  onClose: () => void;
}

function getShareUrl(pin: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}?pin=${pin}`;
}

// OTP-style 6-box input (only used for entering PIN)
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => inputs.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focus(i - 1);
      }
      e.preventDefault();
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = value.slice(0, i) + digit + value.slice(i + 1);
    onChange(next.slice(0, 6));
    if (i < 5) focus(i + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); focus(Math.min(pasted.length, 5)); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onClick={() => focus(i)}
          className="w-11 h-14 text-center text-2xl font-bold border-2 border-[#e0e0e0] rounded-2xl focus:border-[#1c1c1c] focus:outline-none transition-colors bg-[#fafafa] focus:bg-white"
        />
      ))}
    </div>
  );
}

// Phase: fade-out → swap → height-animate → fade-in
type Phase = "idle" | "fading-out" | "resizing" | "fading-in";

function useTabTransition(tab: "qr" | "code") {
  const [visibleTab, setVisibleTab] = useState(tab);
  const [phase, setPhase] = useState<Phase>("idle");
  const pendingTab = useRef(tab);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  // Initialise height after first render
  useEffect(() => {
    if (innerRef.current) setHeight(innerRef.current.offsetHeight);
  }, []);

  const transition = useCallback((next: "qr" | "code") => {
    if (next === visibleTab && phase === "idle") return;
    pendingTab.current = next;
    setPhase("fading-out");
  }, [visibleTab, phase]);

  useEffect(() => {
    if (phase === "fading-out") {
      // After fade-out (300ms), swap content
      const t = setTimeout(() => {
        setVisibleTab(pendingTab.current);
        setPhase("resizing");
      }, 300);
      return () => clearTimeout(t);
    }
    if (phase === "resizing") {
      // One RAF to let React paint new content, then measure + animate height
      const raf = requestAnimationFrame(() => {
        if (innerRef.current) setHeight(innerRef.current.offsetHeight);
        setPhase("fading-in");
      });
      return () => cancelAnimationFrame(raf);
    }
    if (phase === "fading-in") {
      // After height + fade-in settle (500ms), return to idle
      const t = setTimeout(() => setPhase("idle"), 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const opacity = phase === "fading-out" ? 0 : phase === "resizing" ? 0 : 1;

  return { visibleTab, phase, height, opacity, wrapperRef, innerRef, transition };
}

export function PinDialog({ mode, pin, onJoin, onClose }: PinDialogProps) {
  const [inputPin, setInputPin] = useState("");
  const [tab, setTab] = useState<"qr" | "code">("qr");
  const { visibleTab, height, opacity, innerRef, transition } = useTabTransition(tab);
  const { backdropRef, panelRef, close } = useModalAnimation(onClose);

  const shareUrl = pin ? getShareUrl(pin) : "";

  const switchTab = (next: "qr" | "code") => {
    setTab(next);
    transition(next);
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div ref={panelRef} className="bg-white w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-[#e0e0e0] rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-lg">
            {mode === "create" ? "Share Connection" : "Join Device"}
          </h2>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === "create" && pin ? (
          <>
            {/* Height-animating outer, opacity-animating inner */}
            <div
              style={{
                height: height !== undefined ? height : undefined,
                transition: "height 420ms cubic-bezier(0.4, 0, 0.2, 1)",
                overflow: "hidden",
              }}
            >
              <div
                ref={innerRef}
                style={{
                  opacity,
                  transition: opacity === 0
                    ? "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1)"
                    : "opacity 380ms cubic-bezier(0.0, 0, 0.2, 1) 60ms",
                }}
              >
                <div className="flex justify-center mb-5">
                  {visibleTab === "qr" ? (
                    <div className="p-4 bg-white rounded-2xl border border-[#f0f0f0] inline-block">
                      <QRCodeSVG
                        value={shareUrl}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#1c1c1c"
                        level="M"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 w-full">
                      {/* Plain large PIN — no boxes */}
                      <p className="text-5xl font-bold tracking-[0.25em] text-[#1c1c1c]">
                        {pin}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle pill */}
            <div className="flex justify-center mb-5">
              <div className="flex bg-[#f0f0f0] rounded-full p-1 gap-1">
                <button
                  onClick={() => switchTab("qr")}
                  className={`px-5 py-1.5 rounded-full text-sm transition-all duration-300 ${
                    tab === "qr"
                      ? "bg-white text-[#1c1c1c] shadow-sm"
                      : "text-[#999] hover:text-[#1c1c1c]"
                  }`}
                >
                  QR Code
                </button>
                <button
                  onClick={() => switchTab("code")}
                  className={`px-5 py-1.5 rounded-full text-sm transition-all duration-300 ${
                    tab === "code"
                      ? "bg-white text-[#1c1c1c] shadow-sm"
                      : "text-[#999] hover:text-[#1c1c1c]"
                  }`}
                >
                  PIN Code
                </button>
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-[#999]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Waiting for connection...
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <OtpInput value={inputPin} onChange={setInputPin} />
            </div>
            <button
              onClick={() => onJoin?.(inputPin)}
              disabled={inputPin.length !== 6}
              className="w-full py-3.5 rounded-3xl bg-[#1c1c1c] text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
            >
              Connect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
