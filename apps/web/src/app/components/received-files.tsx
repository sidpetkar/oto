"use client";

import { useState } from "react";
import { X, Download, Trash2, File, Image, FileVideo, FileText, ArrowLeft, Inbox } from "lucide-react";
import { MediaViewer } from "./media-viewer";

export interface ReceivedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  timestamp: number;
  from: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

function FileIcon({ type }: { type: string }) {
  const cls = "w-5 h-5 text-[#999]";
  if (type.startsWith("image/")) return <Image className={cls} />;
  if (type.startsWith("video/")) return <FileVideo className={cls} />;
  if (type.includes("text") || type.includes("pdf")) return <FileText className={cls} />;
  return <File className={cls} />;
}

function isMedia(type: string) {
  return type.startsWith("image/") || type.startsWith("video/");
}

function FilePreview({ file, onClick }: { file: ReceivedFile; onClick?: () => void }) {
  if (file.type.startsWith("image/")) {
    return (
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0"
      >
        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
      </button>
    );
  }
  if (file.type.startsWith("video/")) {
    return (
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0 relative"
      >
        <video src={file.url} className="w-full h-full object-cover" muted />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="text-white text-[10px] font-bold">PLAY</span>
        </div>
      </button>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-[#f0f0f0] flex items-center justify-center shrink-0">
      <FileIcon type={file.type} />
    </div>
  );
}

function handleDownload(file: ReceivedFile) {
  const a = document.createElement("a");
  a.href = file.url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

interface ReceivedFilesProps {
  files: ReceivedFile[];
  onClose: () => void;
  onClear: () => void;
}

export function ReceivedFiles({ files, onClose, onClear }: ReceivedFilesProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const mediaFiles = files.filter((f) => isMedia(f.type));

  const openMedia = (file: ReceivedFile) => {
    const idx = mediaFiles.findIndex((f) => f.id === file.id);
    if (idx >= 0) setViewerIndex(idx);
  };

  // Group by "from" to get the latest batch
  const latestFrom = files.length > 0 ? files[0].from : null;
  const latestBatch = latestFrom
    ? files.filter((f) => f.from === latestFrom && Date.now() - f.timestamp < 300000)
    : [];

  return (
    <>
      <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-md mx-auto w-full">
        <header className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">Received Files</h1>
              {files.length > 0 && (
                <p className="text-xs text-[#999]">
                  {files.length} file{files.length !== 1 ? "s" : ""} · {formatSize(totalSize)}
                </p>
              )}
            </div>
          </div>
          {files.length > 0 && (
            <button
              onClick={onClear}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors text-[#999]"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </header>

        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#f0f0f0] flex items-center justify-center">
              <Inbox className="w-7 h-7 text-[#ccc]" />
            </div>
            <p className="text-sm text-[#999]">No files received yet</p>
            <p className="text-xs text-[#ccc]">Files sent to you will appear here</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-3 space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors"
                >
                  <FilePreview
                    file={file}
                    onClick={isMedia(file.type) ? () => openMedia(file) : undefined}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-[#999]">
                      {formatSize(file.size)} · from {file.from}
                    </p>
                    <p className="text-[10px] text-[#ccc]">{timeAgo(file.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="w-10 h-10 rounded-xl bg-[#1c1c1c] text-white flex items-center justify-center hover:bg-[#333] transition-colors shrink-0"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="px-5 py-4 border-t border-[#f0f0f0] space-y-2">
            {latestBatch.length > 1 && (
              <button
                onClick={() => latestBatch.forEach(handleDownload)}
                className="w-full py-3 rounded-2xl bg-[#f0f0f0] text-[#1c1c1c] font-medium text-sm hover:bg-[#e0e0e0] transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Latest Batch ({latestBatch.length})
              </button>
            )}
            <button
              onClick={() => files.forEach(handleDownload)}
              className="w-full py-3.5 rounded-2xl bg-[#1c1c1c] text-white font-medium text-sm hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All ({files.length} file{files.length !== 1 ? "s" : ""})
            </button>
          </div>
        )}
      </div>

      {viewerIndex !== null && (
        <MediaViewer
          files={mediaFiles}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
