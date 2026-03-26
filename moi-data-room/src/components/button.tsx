"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export function Button({
  children,
  variant = "primary",
  size = "sm",
  className,
  ...rest
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  const [hovered, setHovered] = useState(false);

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2 text-[13px]",
    lg: "px-7 py-3 text-sm",
  };

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border-none font-sans font-semibold tracking-[0.01em] transition-all duration-200 cursor-pointer",
        sizeClasses[size],
        variant === "primary" && [
          hovered ? "bg-[#8B71FF]" : "bg-accent",
          "text-white",
          hovered && "shadow-[0_0_20px_var(--accent-glow)]",
        ],
        variant === "ghost" && [
          hovered ? "bg-accent-dim" : "bg-transparent",
          hovered ? "text-accent" : "text-text-dim",
          hovered ? "border border-accent" : "border border-transparent",
        ],
        variant === "outline" && "bg-transparent text-text-dim border border-border",
        rest.disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
}
