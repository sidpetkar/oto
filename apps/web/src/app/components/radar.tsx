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

// Distribute peers in a circle around center
function getPeerPosition(index: number, total: number) {
  const ringRadii = [28, 42]; // percentage from center
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
      {/* Rings */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[#e8e8e8]"
          style={{
            width: `${i * 25}%`,
            height: `${i * 25}%`,
            left: `${50 - (i * 25) / 2}%`,
            top: `${50 - (i * 25) / 2}%`,
          }}
        />
      ))}

      {/* Pulse ring */}
      <div
        className="absolute rounded-full border-2 border-[#1c1c1c]/20 radar-ring"
        style={{
          width: "25%",
          height: "25%",
          left: "37.5%",
          top: "37.5%",
        }}
      />

      {/* Self in center */}
      <div
        className="absolute w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg z-10 shadow-lg"
        style={{
          backgroundColor: self.avatarColor || "#f4d03f",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {self.otterName[0]}
      </div>

      {/* Peers */}
      {peers.map((peer, i) => {
        const pos = getPeerPosition(i, peers.length);
        return (
          <button
            key={peer.id}
            onClick={() => onPeerClick(peer)}
            className="absolute flex flex-col items-center gap-1 device-float z-10 group"
            style={{
              left: pos.left,
              top: pos.top,
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#e8e8e8] flex items-center justify-center shadow-sm group-hover:border-[#1c1c1c] group-hover:shadow-md transition-all">
              <PlatformIcon platform={peer.platform} />
            </div>
            <span className="text-[10px] font-medium text-[#999] group-hover:text-[#1c1c1c] transition-colors">
              {peer.otterName}
            </span>
          </button>
        );
      })}

      {/* Empty state */}
      {peers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-[#999] mt-24">
            Searching for nearby devices...
          </p>
        </div>
      )}
    </div>
  );
}
