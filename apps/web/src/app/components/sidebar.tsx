"use client";

import { useState, useEffect } from "react";
import { X, Sun, Moon, Plus, LogIn } from "lucide-react";
import { useTheme } from "../../lib/theme";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onCreateDrop?: () => void;
  onJoinDrop?: () => void;
}

export function Sidebar({ open, onClose, onCreateDrop, onJoinDrop }: SidebarProps) {
  const { theme, toggle } = useTheme();
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
  };

  useEffect(() => {
    if (closing) {
      const t = setTimeout(() => {
        setClosing(false);
        onClose();
      }, 240);
      return () => clearTimeout(t);
    }
  }, [closing, onClose]);

  const handleAction = (cb?: () => void) => {
    handleClose();
    setTimeout(() => cb?.(), 260);
  };

  if (!open && !closing) return null;

  return (
    <div className="fixed inset-0 z-[70] flex">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-240 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundColor: "var(--c-backdrop)" }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`relative w-72 max-w-[80vw] h-full flex flex-col ${
          closing ? "sidebar-slide-out" : "sidebar-slide-in"
        }`}
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <span className="text-[22px] leading-none tracking-tight italic">
            <span style={{ fontWeight: 500 }}>OTO</span>
            <span style={{ fontWeight: 100, color: "var(--c-text-secondary)" }}>Send</span>
          </span>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "var(--c-bg-overlay)" }}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" style={{ color: "var(--c-text)" }} />
          </button>
        </div>

        <div className="w-full px-5">
          <div className="h-px" style={{ backgroundColor: "var(--c-border)" }} />
        </div>

        {/* Menu items */}
        <div className="px-5 pt-5 space-y-2">
          {/* Create Drop */}
          <button
            onClick={() => handleAction(onCreateDrop)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors text-left"
            style={{ backgroundColor: "var(--c-bg-raised)" }}
          >
            <Plus className="w-5 h-5" style={{ color: "var(--c-text-muted)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
              Create Drop
            </span>
          </button>

          {/* Join Drop */}
          <button
            onClick={() => handleAction(onJoinDrop)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors text-left"
            style={{ backgroundColor: "var(--c-bg-raised)" }}
          >
            <LogIn className="w-5 h-5" style={{ color: "var(--c-text-muted)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
              Join Drop
            </span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors"
            style={{ backgroundColor: "var(--c-bg-raised)" }}
          >
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-5 h-5" style={{ color: "var(--c-text-muted)" }} />
              ) : (
                <Sun className="w-5 h-5" style={{ color: "var(--c-text-muted)" }} />
              )}
              <span className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </div>

            {/* Toggle pill */}
            <div
              className="relative w-11 h-6 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: theme === "dark" ? "var(--c-accent)" : "var(--c-border-strong)",
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center"
                style={{
                  backgroundColor: theme === "dark" ? "var(--c-on-accent)" : "var(--c-bg)",
                  transform: theme === "dark" ? "translateX(22px)" : "translateX(2px)",
                }}
              >
                {theme === "dark" ? (
                  <Moon className="w-3 h-3" style={{ color: "var(--c-accent)" }} />
                ) : (
                  <Sun className="w-3 h-3" style={{ color: "#1c1c1c" }} />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Google sign-in */}
        <div className="px-5 pb-6">
          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full transition-colors"
            style={{
              backgroundColor: "var(--c-accent)",
              color: "var(--c-on-accent)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.532 24.553c0-1.632-.132-3.272-.414-4.877H24.48v9.242h12.963a11.089 11.089 0 0 1-4.804 7.27l-.044.292 6.974 5.407.483.048C44.67 37.772 47.532 31.678 47.532 24.553Z" fill="#4285F4"/>
              <path d="M24.48 48c6.48 0 11.93-2.148 15.9-5.84l-7.413-5.747c-2.088 1.404-4.86 2.22-8.487 2.22-6.48 0-12-4.38-13.968-10.44l-.276.023-7.258 5.616-.095.264C7.308 42.564 15.348 48 24.48 48Z" fill="#34A853"/>
              <path d="M10.512 28.193A14.573 14.573 0 0 1 9.72 23.4c0-1.668.288-3.282.78-4.794l-.013-.312-7.346-5.706-.24.115A24.133 24.133 0 0 0 .36 23.4c0 3.888.924 7.56 2.544 10.8l7.608-5.907Z" fill="#FBBC05"/>
              <path d="M24.48 9.564c4.536 0 7.596 1.956 9.348 3.588l6.816-6.66C36.396 2.448 30.96 0 24.48 0 15.348 0 7.308 5.436 2.904 13.296l7.596 5.898c1.98-6.06 7.5-9.63 13.98-9.63Z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
