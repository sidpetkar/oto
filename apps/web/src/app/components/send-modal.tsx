"use client";

import { useState, useRef } from "react";
import { X, Upload, File as FileIcon } from "lucide-react";
import type { DeviceInfo } from "@oto/protocol";
import { formatSize } from "../../lib/format";

interface SendModalProps {
  peer: DeviceInfo;
  onSend: (files: File[]) => void;
  onClose: () => void;
}

export function SendModal({ peer, onSend, onClose }: SendModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files));
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 max-h-[85vh] flex flex-col">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-[#e0e0e0] rounded-full mx-auto mb-5 sm:hidden" />

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
              <p className="text-xs text-[#999]">{peer.platform}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center hover:bg-[#e0e0e0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#e0e0e0] rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#1c1c1c] hover:bg-[#fafafa] transition-all mb-4"
        >
          <Upload className="w-8 h-8 text-[#999] mb-2" />
          <p className="text-sm text-[#999]">Drop files or tap to select</p>
          <input ref={inputRef} type="file" multiple onChange={handleFiles} className="hidden" />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-4 border border-[#f0f0f0] rounded-3xl">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0] last:border-0"
              >
                <FileIcon className="w-5 h-5 text-[#999] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{f.name}</p>
                  <p className="text-xs text-[#999]">
                    {formatSize(f.size)} · {f.type.split("/").pop() || "file"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Send button */}
        <button
          onClick={() => onSend(files)}
          disabled={files.length === 0}
          className="w-full py-3.5 rounded-3xl bg-[#1c1c1c] text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#333] transition-colors"
        >
          {files.length === 0
            ? "Select files to send"
            : `Send ${files.length} file${files.length > 1 ? "s" : ""} · ${formatSize(totalSize)}`}
        </button>
      </div>
    </div>
  );
}
