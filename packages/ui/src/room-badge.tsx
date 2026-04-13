import React from "react";
import { clsx } from "clsx";

interface RoomBadgeProps {
  name: string;
  emoji?: string;
  active?: boolean;
  memberCount?: number;
  onClick?: () => void;
}

export function RoomBadge({
  name,
  emoji = "📁",
  active = false,
  memberCount,
  onClick,
}: RoomBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm transition-colors whitespace-nowrap",
        active
          ? "bg-[#1c1c1c] text-white"
          : "bg-[#f0f0f0] text-[#1c1c1c] hover:bg-[#e0e0e0]"
      )}
    >
      <span>{emoji}</span>
      <span>{name}</span>
      {memberCount !== undefined && (
        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
          {memberCount}
        </span>
      )}
    </button>
  );
}
