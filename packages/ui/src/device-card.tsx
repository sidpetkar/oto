import React from "react";
import { Monitor, Smartphone, Globe, Laptop } from "lucide-react";
import type { Platform } from "@oto/protocol";

interface DeviceCardProps {
  name: string;
  otterName: string;
  platform: Platform;
  avatarColor: string;
  isNearby?: boolean;
  onClick?: () => void;
}

function PlatformIcon({ platform }: { platform: Platform }) {
  const cls = "w-4 h-4";
  switch (platform) {
    case "android":
    case "ios":
      return <Smartphone className={cls} />;
    case "windows":
    case "linux":
      return <Monitor className={cls} />;
    case "mac":
      return <Laptop className={cls} />;
    case "browser":
      return <Globe className={cls} />;
  }
}

export function DeviceCard({
  name,
  otterName,
  platform,
  avatarColor,
  isNearby = true,
  onClick,
}: DeviceCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-[#f5f5f5] transition-colors w-full text-left"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm shrink-0"
        style={{ backgroundColor: avatarColor }}
      >
        {otterName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono font-medium text-[#1c1c1c] text-sm truncate">{otterName}</p>
        <p className="font-mono text-xs text-[#999] truncate">{name}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <PlatformIcon platform={platform} />
        {isNearby && (
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
    </button>
  );
}
