"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils"; // your className utility

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "ghost" | "outline" | "icon";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "solid", className, style, size = "md", ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    let baseStyle: React.CSSProperties = {};

    switch (variant) {
      case "solid":
        baseStyle = {
          backgroundColor: isHovered
            ? "var(--button-background-hover)"
            : "var(--button-background)",
          color: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          border: "1px solid var(--btn-accent)",
        };
        break;
      case "ghost":
        baseStyle = {
          backgroundColor: "var(--color-accent-950)",
          color: "#fff",
          border: "1px solid transparent",
        };
        break;
      case "outline":
        baseStyle = {
          backgroundColor: "transparent",
          color: "#ffffff",
          border: "1px solid var(--btn-accent)",
        };
        break;
      case "icon":
        baseStyle = {
          backgroundColor: "var(--btn-accent)",
          color: "#ffffff",
          border: "1px solid var(--btn-accent)",
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
    } else {
      sizeClasses = "px-4 py-2 text-base";
    }

    return (
      <button
        ref={ref}
        style={{ ...baseStyle, ...style }}
        className={cn(
          sizeClasses,
          "rounded shadow transition-all hover:shadow-lg active:shadow-sm",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
