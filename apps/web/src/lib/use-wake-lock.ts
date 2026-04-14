"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Keeps the screen awake using the Screen Wake Lock API.
 * Automatically re-acquires on visibility change (iOS releases on tab switch).
 * Falls back gracefully — does nothing if unsupported.
 */
export function useWakeLock(active: boolean) {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLock.current = await navigator.wakeLock.request("screen");
      wakeLock.current.addEventListener("release", () => {
        wakeLock.current = null;
      });
    } catch {
      // Battery saver or permission denied — not critical
    }
  }, []);

  const release = useCallback(() => {
    if (wakeLock.current) {
      wakeLock.current.release().catch(() => {});
      wakeLock.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active) {
      release();
      return;
    }

    acquire();

    // Re-acquire when returning to app (iOS releases wake lock on tab switch)
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && active) {
        acquire();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      release();
    };
  }, [active, acquire, release]);
}
