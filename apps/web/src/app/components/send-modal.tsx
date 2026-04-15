"use client";

import { useState, useRef } from "react";
import { X, Upload, File as FileIcon } from "lucide-react";
import type { DeviceInfo } from "@oto/protocol";
import { formatSize } from "../../lib/format";
import { useModalAnimation } from "../../lib/use-modal-animation";

interface SendModalProps {
  peer: DeviceInfo;
  onSend: (files: File[]) => void;
  onClose: () => void;
}

export function SendModal({ peer, onSend, onClose }: SendModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { backdropRef, panelRef, close } = useModalAnimation(onClose);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files));
  };

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
        className="w-full max-w-md rounded-[2rem] p-6 max-h-[85vh] flex flex-col"
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: peer.avatarColor }}
            >
              {peer.otterName[0]}
            </div>
            <div>
              <p className="font-medium text-sm">Send to {peer.otterName}</p>
              <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>{peer.platform}</p>
            </div>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--c-bg-overlay)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-4"
          style={{ borderColor: "var(--c-border-strong)" }}
        >
          <Upload className="w-8 h-8 mb-2" style={{ color: "var(--c-text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>Drop files or tap to select</p>
          <input ref={inputRef} type="file" multiple onChange={handleFiles} className="hidden" />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-4 border rounded-3xl" style={{ borderColor: "var(--c-border)" }}>
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 last:border-0"
                style={{ borderBottomWidth: "1px", borderBottomColor: "var(--c-border)" }}
              >
                <FileIcon className="w-5 h-5 shrink-0" style={{ color: "var(--c-text-muted)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{f.name}</p>
                  <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>{formatSize(f.size)} · {f.type.split("/").pop() || "file"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Send button */}
        <button
          onClick={() => onSend(files)}
          disabled={files.length === 0}
          className="w-full py-3.5 rounded-3xl font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: "var(--c-accent)", color: "var(--c-on-accent)" }}
        >
          {files.length === 0
            ? "Select files to send"
            : `Send ${files.length} file${files.length > 1 ? "s" : ""} · ${formatSize(totalSize)}`}
        </button>
      </div>
    </div>
  );
}
