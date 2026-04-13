import React from "react";
import { Wifi, Globe, WifiOff } from "lucide-react";
import type { TransferMode } from "@oto/protocol";

interface ModeIndicatorProps {
  mode: TransferMode | "offline";
}

export function ModeIndicator({ mode }: ModeIndicatorProps) {
  const config = {
    local: { icon: Wifi, label: "Local", color: "text-green-600" },
    relay: { icon: Globe, label: "Relay", color: "text-blue-600" },
    offline: { icon: WifiOff, label: "Offline", color: "text-[#999]" },
  }[mode];

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs">
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className={config.color}>{config.label}</span>
    </div>
  );
}
