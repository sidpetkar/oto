import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <span className={`font-mono font-bold tracking-tight text-[#1c1c1c] ${sizes[size]}`}>
      OTODrop
    </span>
  );
}
