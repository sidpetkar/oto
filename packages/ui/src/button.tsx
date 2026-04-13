import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "font-mono font-medium transition-all duration-200 rounded-xl",
        {
          "bg-[#1c1c1c] text-white hover:bg-[#333]": variant === "primary",
          "bg-[#cccccc] text-[#1c1c1c] hover:bg-[#b0b0b0]": variant === "secondary",
          "bg-transparent text-[#1c1c1c] hover:bg-[#f0f0f0]": variant === "ghost",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-5 py-2.5 text-base": size === "md",
          "px-8 py-3.5 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
