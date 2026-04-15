"use client";

import type { DeviceInfo } from "@oto/protocol";

interface RadarProps {
  self: DeviceInfo;
  peers: DeviceInfo[];
  onPeerClick: (peer: DeviceInfo) => void;
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

function DeviceCircle({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-md"
      style={{ backgroundColor: color }}
    >
      {name[0]}
    </div>
  );
}

export function Radar({ self, peers, onPeerClick }: RadarProps) {
  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square">
      {/* 4 ripple rings */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full radar-ring"
          style={{
            border: "1.5px solid var(--c-radar-ring)",
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
        className="absolute flex flex-col items-center gap-1.5 z-10"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <DeviceCircle name={self.otterName} color={self.avatarColor || "#f4d03f"} />
        <span
          className="text-xs whitespace-nowrap"
          style={{ fontWeight: 300, color: "var(--c-text-dim)" }}
        >
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
            className="absolute flex flex-col items-center gap-1.5 z-10 group"
            style={{
              left: pos.left,
              top: pos.top,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="flex flex-col items-center gap-1.5 device-float"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <DeviceCircle name={peer.otterName} color={peer.avatarColor || "#999"} />
              <span
                className="text-xs whitespace-nowrap transition-colors"
                style={{ fontWeight: 300, color: "var(--c-text-muted)" }}
              >
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
