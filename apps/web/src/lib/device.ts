import { generateDeviceId, generateOtterName, generateAvatarColor } from "@oto/core";
import type { DeviceInfo, Platform } from "@oto/protocol";

const STORAGE_KEY = "oto-device";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "browser";
}

export function getOrCreateDevice(): DeviceInfo {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // corrupted, regenerate
    }
  }

  const id = generateDeviceId();
  const device: DeviceInfo = {
    id,
    name: detectPlatform(),
    otterName: generateOtterName(id),
    publicKey: "",
    platform: detectPlatform(),
    avatarColor: generateAvatarColor(id),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
  return device;
}

export function updateDeviceName(name: string): DeviceInfo {
  const device = getOrCreateDevice();
  device.otterName = name;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
  return device;
}
