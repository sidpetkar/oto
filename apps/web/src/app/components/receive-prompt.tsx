"use client";

import { Check, X } from "lucide-react";
import type { DeviceInfo, FileMetadata } from "@oto/protocol";
import { formatSize } from "../../lib/format";

interface ReceivePromptProps {
  sender: DeviceInfo;
  files: FileMetadata[];
  onAccept: () => void;
  onReject: () => void;
}

export function ReceivePrompt({
  sender,
  files,
  onAccept,
  onReject,
}: ReceivePromptProps) {
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: sender.avatarColor }}
          >
            {sender.otterName[0]}
          </div>
          <div>
            <p className="font-medium">
              {sender.otterName} wants to send
            </p>
            <p className="text-sm text-[#999]">
              {files.length} file{files.length > 1 ? "s" : ""} ·{" "}
              {formatSize(totalSize)}
            </p>
          </div>
        </div>

        <div className="border border-[#f0f0f0] rounded-2xl mb-6 max-h-48 overflow-y-auto">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-[#f0f0f0] last:border-0"
            >
              <span className="text-sm flex-1 truncate">{f.name}</span>
              <span className="text-xs text-[#999] shrink-0">
                {formatSize(f.size)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 py-3.5 rounded-2xl bg-[#f0f0f0] text-[#1c1c1c] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#e0e0e0] transition-colors"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3.5 rounded-2xl bg-[#1c1c1c] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#333] transition-colors"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
