"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { ReceivedFile } from "./received-files";

interface MediaViewerProps {
  files: ReceivedFile[];
  initialIndex: number;
  onClose: () => void;
}

export function MediaViewer({ files, initialIndex, onClose }: MediaViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const file = files[index];
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  const prev = () => setIndex((i) => (i > 0 ? i - 1 : files.length - 1));
  const next = () => setIndex((i) => (i < files.length - 1 ? i + 1 : 0));

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="text-center flex-1 min-w-0 px-2">
          <p className="text-white text-sm truncate">{file.name}</p>
          <p className="text-white/50 text-xs">{index + 1} of {files.length}</p>
        </div>
        <button onClick={handleDownload} className="w-10 h-10 flex items-center justify-center">
          <Download className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {files.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-2 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {isImage && (
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        )}
        {isVideo && (
          <video
            src={file.url}
            controls
            autoPlay
            className="max-w-full max-h-full object-contain"
          />
        )}

        {files.length > 1 && (
          <button
            onClick={next}
            className="absolute right-2 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Thumbnail carousel */}
      {files.length > 1 && (
        <div className="bg-black/80 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar justify-center">
            {files.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setIndex(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  i === index ? "border-white" : "border-transparent opacity-50"
                }`}
              >
                {f.type.startsWith("image/") ? (
                  <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#333] flex items-center justify-center">
                    <span className="text-white text-[8px]">VID</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
