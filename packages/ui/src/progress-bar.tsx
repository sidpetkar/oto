import React from "react";
import { clsx } from "clsx";

interface ProgressBarProps {
  progress: number; // 0-100
  speed?: string;
  className?: string;
}

export function ProgressBar({ progress, speed, className }: ProgressBarProps) {
  return (
    <div className={clsx("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-xs text-[#999]">
          {Math.round(progress)}%
        </span>
        {speed && (
          <span className="font-mono text-xs text-[#999]">{speed}</span>
        )}
      </div>
      <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1c1c1c] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
