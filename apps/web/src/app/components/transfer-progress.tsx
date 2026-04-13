"use client";

import { Check, Loader2, Clock, X } from "lucide-react";
import type { TransferProgress as TProgress } from "../../lib/webrtc";
import { formatSpeed } from "../../lib/format";

interface TransferProgressProps {
  transfers: TProgress[];
  onClose: () => void;
  onCancel?: () => void;
}

export function TransferProgress({ transfers, onClose, onCancel }: TransferProgressProps) {
  const allDone = transfers.length > 0 && transfers.every((t) => t.status === "complete");
  const allWaiting = transfers.every((t) => t.status === "waiting");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-lg">
            {allDone
              ? "Transfer Complete"
              : allWaiting
                ? "Waiting for Accept..."
                : "Transferring..."}
          </h2>
          {!allDone && (
            <button
              onClick={onCancel ?? onClose}
              className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
          {transfers.map((t) => (
            <div key={t.fileId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm truncate flex-1 mr-2">{t.fileName}</span>
                {t.status === "complete" ? (
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                ) : t.status === "waiting" ? (
                  <Clock className="w-4 h-4 text-[#999] shrink-0" />
                ) : (
                  <span className="text-xs text-[#999] shrink-0">
                    {t.speed > 0 ? formatSpeed(t.speed) : ""}
                  </span>
                )}
              </div>
              <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${t.status === "waiting" ? 0 : Math.min(100, t.progress)}%`,
                    backgroundColor: t.status === "complete" ? "#22c55e" : "#1c1c1c",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {allWaiting && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#999]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Waiting for receiver to accept...
          </div>
        )}

        {!allDone && !allWaiting && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#999]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </div>
        )}

        {allDone && (
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#1c1c1c] text-white font-medium text-sm hover:bg-[#333] transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
