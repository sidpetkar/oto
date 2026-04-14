"use client";

import type { DeviceInfo } from "@oto/protocol";
import { Monitor, Smartphone, Globe, Laptop } from "lucide-react";

interface RadarProps {
  self: DeviceInfo;
  peers: DeviceInfo[];
  onPeerClick: (peer: DeviceInfo) => void;
}

function PlatformIcon({ platform }: { platform: string }) {
  const cls = "w-4 h-4 text-[#1c1c1c]";
  switch (platform) {
    case "android":
    case "ios":
      return <Smartphone className={cls} />;
    case "windows":
    case "linux":
      return <Monitor className={cls} />;
    case "mac":
      return <Laptop className={cls} />;
    default:
      return <Globe className={cls} />;
  }
}

function getPeerPosition(index: number, total: number) {
  const ringRadii = [28, 42];
  const ring = index < 4 ? 0 : 1;
  const ringIndex = ring === 0 ? index : index - 4;
  const ringTotal = ring === 0 ? Math.min(total, 4) : total - 4;
  const angle = (ringIndex / Math.max(ringTotal, 1)) * 2 * Math.PI - Math.PI / 2;
  const radius = ringRadii[ring] || 42;
  return {
    left: `${50 + radius * Math.cos(angle)}%`,
    top: `${50 + radius * Math.sin(angle)}%`,
  };
}

export function Radar({ self, peers, onPeerClick }: RadarProps) {
  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square">
      {/* 4 ripple rings — constant speed, evenly spaced, loop from center outward */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[#1c1c1c]/40 radar-ring"
          style={{
            width: "100%",
            height: "100%",
            left: "50%",
            top: "50%",
            animationDelay: `${-i * 1.5}s`,
          }}
        />
      ))}

      {/* Self in center */}
      <div
        className="absolute flex flex-col items-center gap-1 z-10"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          style={{ backgroundColor: self.avatarColor || "#f4d03f" }}
        >
          {self.otterName[0]}
        </div>
        <span className="text-[10px] font-medium text-[#666] whitespace-nowrap">
          {self.otterName}
        </span>
      </div>

      {/* Peers */}
      {peers.map((peer, i) => {
        const pos = getPeerPosition(i, peers.length);
        return (
          <button
            key={peer.id}
            onClick={() => onPeerClick(peer)}
            className="absolute flex flex-col items-center gap-1 z-10 group"
            style={{
              left: pos.left,
              top: pos.top,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Float wrapper — animates only Y so positioning is not disturbed */}
            <div
              className="flex flex-col items-center gap-1 device-float"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-white border-2 border-[#e8e8e8] flex items-center justify-center shadow-sm group-hover:border-[#1c1c1c] group-hover:shadow-md transition-all">
                <PlatformIcon platform={peer.platform} />
              </div>
              <span className="text-[10px] font-medium text-[#999] group-hover:text-[#1c1c1c] transition-colors">
                {peer.otterName}
              </span>
            </div>
          </button>
        );
      })}

      {peers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" />
      )}
    </div>
  );
}
