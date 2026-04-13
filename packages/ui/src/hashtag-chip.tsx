import React from "react";
import { clsx } from "clsx";
import { Hash } from "lucide-react";

interface HashtagChipProps {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}

export function HashtagChip({ tag, active = false, onClick }: HashtagChipProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-mono text-sm transition-colors whitespace-nowrap",
        active
          ? "bg-[#1c1c1c] text-white"
          : "bg-[#f0f0f0] text-[#1c1c1c] hover:bg-[#e0e0e0]"
      )}
    >
      <Hash className="w-3 h-3" />
      {tag.replace(/^#/, "")}
    </button>
  );
}
