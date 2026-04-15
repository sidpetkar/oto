"use client";

import { Check, X } from "lucide-react";
import type { DeviceInfo, FileMetadata } from "@oto/protocol";
import { formatSize } from "../../lib/format";
import { useModalAnimation } from "../../lib/use-modal-animation";

interface ReceivePromptProps {
  sender: DeviceInfo;
  files: FileMetadata[];
  onAccept: () => void;
  onReject: () => void;
}

export function ReceivePrompt({ sender, files, onAccept, onReject }: ReceivePromptProps) {
  const { backdropRef, panelRef, close } = useModalAnimation(onReject);
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: "var(--c-backdrop)" }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-[2rem] p-6"
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        {/* Header row with X */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: sender.avatarColor }}
            >
              {sender.otterName[0]}
            </div>
            <div>
              <p className="font-medium">{sender.otterName} wants to send</p>
              <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>
                {files.length} file{files.length > 1 ? "s" : ""} · {formatSize(totalSize)}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ml-2"
            style={{ backgroundColor: "var(--c-bg-overlay)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="border rounded-3xl mb-6 max-h-48 overflow-y-auto" style={{ borderColor: "var(--c-border)" }}>
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-4 py-2.5 last:border-0"
              style={{ borderBottomWidth: "1px", borderBottomColor: "var(--c-border)" }}
            >
              <span className="text-sm flex-1 truncate">{f.name}</span>
              <span className="text-xs shrink-0" style={{ color: "var(--c-text-muted)" }}>{formatSize(f.size)}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={close}
            className="flex-1 py-3.5 rounded-3xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ backgroundColor: "var(--c-bg-overlay)", color: "var(--c-text)" }}
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3.5 rounded-3xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ backgroundColor: "var(--c-accent)", color: "var(--c-on-accent)" }}
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
