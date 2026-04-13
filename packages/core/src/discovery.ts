const OTTER_NAMES = [
  "Scout", "Ripple", "Dash", "Tide", "Drift",
  "Current", "Shore", "Wave", "Reef", "Pearl",
  "Brook", "Crest", "Eddy", "Flow", "Gust",
] as const;

const AVATAR_HUES = [
  0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336,
];

export function generateDeviceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // v4
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateOtterName(deviceId: string): string {
  return OTTER_NAMES[hashCode(deviceId) % OTTER_NAMES.length];
}

export function generateAvatarColor(deviceId: string): string {
  const hue = AVATAR_HUES[hashCode(deviceId) % AVATAR_HUES.length];
  return `hsl(${hue}, 70%, 55%)`;
}
