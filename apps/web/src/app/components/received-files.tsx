"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, File, Image, FileVideo, FileText, ArrowLeft, Inbox } from "lucide-react";
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
  const style = { color: "var(--c-text-muted)" };
  if (type.startsWith("image/")) return <Image className="w-5 h-5" style={style} />;
  if (type.startsWith("video/")) return <FileVideo className="w-5 h-5" style={style} />;
  if (type.includes("text") || type.includes("pdf")) return <FileText className="w-5 h-5" style={style} />;
  return <File className="w-5 h-5" style={style} />;
}

function isMedia(type: string) {
  return type.startsWith("image/") || type.startsWith("video/");
}

function FilePreview({ file, onClick }: { file: ReceivedFile; onClick?: () => void }) {
  if (file.type.startsWith("image/")) {
    return (
      <button onClick={onClick} className="w-12 h-12 rounded-2xl overflow-hidden shrink-0" style={{ backgroundColor: "var(--c-bg-overlay)" }}>
        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
      </button>
    );
  }
  if (file.type.startsWith("video/")) {
    return (
      <button onClick={onClick} className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 relative" style={{ backgroundColor: "var(--c-bg-overlay)" }}>
        <video src={file.url} className="w-full h-full object-cover" muted />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="text-white text-[10px] font-bold">PLAY</span>
        </div>
      </button>
    );
  }
  return (
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--c-bg-overlay)" }}>
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
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
  };

  useEffect(() => {
    if (closing) {
      const t = setTimeout(() => onClose(), 280);
      return () => clearTimeout(t);
    }
  }, [closing, onClose]);

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const mediaFiles = files.filter((f) => isMedia(f.type));

  const openMedia = (file: ReceivedFile) => {
    const idx = mediaFiles.findIndex((f) => f.id === file.id);
    if (idx >= 0) setViewerIndex(idx);
  };

  const latestFrom = files.length > 0 ? files[0].from : null;
  const latestBatch = latestFrom
    ? files.filter((f) => f.from === latestFrom && Date.now() - f.timestamp < 300000)
    : [];

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex flex-col max-w-md mx-auto w-full ${
          closing ? "page-slide-out" : "page-slide-in"
        }`}
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottomWidth: "1px", borderBottomColor: "var(--c-border)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base leading-snug font-normal">
                Received
              </h1>
              {files.length > 0 && (
                <p className="text-xs mt-0.5" style={{ color: "var(--c-text-muted)" }}>
                  {files.length} file{files.length !== 1 ? "s" : ""} · {formatSize(totalSize)}
                </p>
              )}
            </div>
          </div>
          {files.length > 0 && (
            <button
              onClick={onClear}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
              style={{ color: "var(--c-text-muted)" }}
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </header>

        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--c-bg-overlay)" }}>
              <Inbox className="w-7 h-7" style={{ color: "var(--c-text-faint)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--c-text-muted)" }}>No files received yet</p>
            <p className="text-xs" style={{ color: "var(--c-text-faint)" }}>Files sent to you will appear here</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-3xl transition-colors"
                  style={{ backgroundColor: "var(--c-bg-raised)" }}
                >
                  <FilePreview
                    file={file}
                    onClick={isMedia(file.type) ? () => openMedia(file) : undefined}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                      {formatSize(file.size)} · from {file.from}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--c-text-faint)" }}>{timeAgo(file.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
                    style={{ backgroundColor: "var(--c-accent)", color: "var(--c-on-accent)" }}
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
          <div className="px-4 py-4 space-y-2" style={{ borderTopWidth: "1px", borderTopColor: "var(--c-border)" }}>
            {latestBatch.length > 1 && (
              <button
                onClick={() => latestBatch.forEach(handleDownload)}
                className="w-full py-3 rounded-3xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--c-bg-overlay)", color: "var(--c-text)" }}
              >
                <Download className="w-4 h-4" />
                Download Latest Batch ({latestBatch.length})
              </button>
            )}
            <button
              onClick={() => files.forEach(handleDownload)}
              className="w-full py-3.5 rounded-3xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--c-accent)", color: "var(--c-on-accent)" }}
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
