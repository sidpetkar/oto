"use client";

import { Check, Loader2, Clock, X } from "lucide-react";
import type { TransferProgress as TProgress } from "../../lib/webrtc";
import { formatSpeed } from "../../lib/format";
import { useModalAnimation } from "../../lib/use-modal-animation";

interface TransferProgressProps {
  transfers: TProgress[];
  onClose: () => void;
  onCancel?: () => void;
}

export function TransferProgress({ transfers, onClose, onCancel }: TransferProgressProps) {
  const allDone    = transfers.length > 0 && transfers.every((t) => t.status === "complete");
  const allWaiting = transfers.every((t) => t.status === "waiting");
  const exitCb     = allDone ? onClose : (onCancel ?? onClose);
  const { backdropRef, panelRef, close } = useModalAnimation(exitCb);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: "var(--c-backdrop)" }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-[2rem] p-6"
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-lg">
            {allDone ? "Transfer Complete" : allWaiting ? "Waiting for Accept..." : "Transferring..."}
          </h2>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--c-bg-overlay)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
          {transfers.map((t) => (
            <div key={t.fileId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm truncate flex-1 mr-2">{t.fileName}</span>
                {t.status === "complete" ? (
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                ) : t.status === "waiting" ? (
                  <Clock className="w-4 h-4 shrink-0" style={{ color: "var(--c-text-muted)" }} />
                ) : (
                  <span className="text-xs shrink-0" style={{ color: "var(--c-text-muted)" }}>
                    {t.speed > 0 ? formatSpeed(t.speed) : ""}
                  </span>
                )}
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-bg-overlay)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${t.status === "waiting" ? 0 : Math.min(100, t.progress)}%`,
                    backgroundColor: t.status === "complete" ? "#22c55e" : "var(--c-accent)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {allWaiting && (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Waiting for receiver to accept...
          </div>
        )}

        {!allDone && !allWaiting && (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </div>
        )}

        {allDone && (
          <button
            onClick={close}
            className="w-full py-3.5 rounded-3xl font-medium text-sm transition-colors"
            style={{ backgroundColor: "var(--c-accent)", color: "var(--c-on-accent)" }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
