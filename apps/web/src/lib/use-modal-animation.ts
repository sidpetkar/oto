"use client";

import { useEffect, useRef, useCallback } from "react";

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";  // fast-in slow-out (spring-like)
const EASE_IN  = "cubic-bezier(0.4, 0, 1, 1)";       // quick exit

export function useModalAnimation(onClose: () => void) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);

  // Detect mobile (≤640px) at runtime
  const isMobile = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

  // Enter animation — plays on mount
  useEffect(() => {
    const backdrop = backdropRef.current;
    const panel    = panelRef.current;
    if (!backdrop || !panel) return;

    backdrop.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 280, easing: EASE_OUT, fill: "both" }
    );

    if (isMobile()) {
      panel.animate(
        [
          { transform: "translateY(100%)", opacity: 1 },
          { transform: "translateY(0)",    opacity: 1 },
        ],
        { duration: 380, easing: EASE_OUT, fill: "both" }
      );
    } else {
      panel.animate(
        [
          { transform: "scale(0.94) translateY(8px)", opacity: 0 },
          { transform: "scale(1)    translateY(0)",   opacity: 1 },
        ],
        { duration: 300, easing: EASE_OUT, fill: "both" }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exit animation — plays before calling onClose
  const close = useCallback(() => {
    const backdrop = backdropRef.current;
    const panel    = panelRef.current;
    if (!backdrop || !panel) { onClose(); return; }

    const done = () => onClose();

    backdrop.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 220, easing: EASE_IN, fill: "both" }
    );

    let anim: Animation;
    if (isMobile()) {
      anim = panel.animate(
        [
          { transform: "translateY(0)",    opacity: 1 },
          { transform: "translateY(100%)", opacity: 1 },
        ],
        { duration: 280, easing: EASE_IN, fill: "both" }
      );
    } else {
      anim = panel.animate(
        [
          { transform: "scale(1)    translateY(0)",   opacity: 1 },
          { transform: "scale(0.94) translateY(8px)", opacity: 0 },
        ],
        { duration: 220, easing: EASE_IN, fill: "both" }
      );
    }

    anim.onfinish = done;
  }, [onClose]);

  return { backdropRef, panelRef, close };
}
