"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "ghost" | "outline" | "icon";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "solid", className, style, size = "md", ...props }, ref) => {
    let baseStyle: React.CSSProperties;
    switch (variant) {
      case "solid":
        baseStyle = {
          backgroundColor: "var(--btn-solid-bg)",
          color: "var(--btn-solid-text)",
        };
        break;
      case "ghost":
        baseStyle = {
          backgroundColor: "transparent",
          color: "var(--btn-ghost-text)",
        };
        break;
      case "outline":
        baseStyle = {
          backgroundColor: "transparent",
          color: "var(--btn-outline-text)",
          border: "1px solid var(--btn-outline-border)",
        };
        break;
      case "icon":
        baseStyle = {
          backgroundColor: "transparent",
          color: "var(--btn-icon-text)",
        };
        break;
      default:
        baseStyle = {};
    }

    let sizeClasses = "";
    if (size === "sm") {
      sizeClasses = "px-2 py-1 text-sm";
    } else if (size === "lg") {
      sizeClasses = "px-6 py-3 text-lg";
    } else if (size === "icon") {
      sizeClasses = "p-2"; // icon buttons get uniform padding
    } else {
      sizeClasses = "px-4 py-2 text-base";
    }

    return (
      <button
        ref={ref}
        style={{ ...baseStyle, ...style }}
        className={cn(sizeClasses, "rounded", className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
