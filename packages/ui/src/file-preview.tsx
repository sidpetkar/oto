import React from "react";
import { File, Image, FileVideo, FileText, FileSpreadsheet } from "lucide-react";
import { clsx } from "clsx";

interface FilePreviewProps {
  name: string;
  size: number;
  type: string;
  selected?: boolean;
  onToggle?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function FileIcon({ type }: { type: string }) {
  const cls = "w-5 h-5 text-[#999]";
  if (type.startsWith("image/")) return <Image className={cls} />;
  if (type.startsWith("video/")) return <FileVideo className={cls} />;
  if (type.includes("spreadsheet") || type.includes("csv")) return <FileSpreadsheet className={cls} />;
  if (type.includes("text") || type.includes("pdf") || type.includes("document")) return <FileText className={cls} />;
  return <File className={cls} />;
}

export function FilePreview({
  name,
  size,
  type,
  selected = false,
  onToggle,
}: FilePreviewProps) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 w-full text-left transition-colors border-b border-[#f0f0f0] last:border-0",
        selected ? "bg-[#f5f5f5]" : "hover:bg-[#fafafa]"
      )}
    >
      <FileIcon type={type} />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm text-[#1c1c1c] truncate">{name}</p>
        <p className="font-mono text-xs text-[#999]">
          {formatSize(size)} · {type.split("/").pop()}
        </p>
      </div>
      {onToggle && (
        <div
          className={clsx(
            "w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center",
            selected ? "border-[#1c1c1c] bg-[#1c1c1c]" : "border-[#ccc]"
          )}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}
    </button>
  );
}
