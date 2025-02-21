"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "ghost" | "outline" | "icon";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "solid", className, style, size = "md", onClick, ...props },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    let baseStyle: React.CSSProperties = {};

    switch (variant) {
      case "solid":
        baseStyle = {
          backgroundColor: isHovered
            ? "var(--button-background-hover)"
            : "var(--button-background)",
          color: "#fff",
          border: "1px solid var(--button-background)",
        };
        break;
      case "ghost":
        baseStyle = {
          backgroundColor: isHovered
            ? "var(--button-background-hover)"
            : "transparent",
          color: "var(--button-background)",
          border: "1px solid transparent",
        };
        break;
      case "outline":
        baseStyle = {
          backgroundColor: "transparent",
          color: "var(--button-background)",
          border: "1px solid var(--button-background)",
        };
        break;
      case "icon":
        baseStyle = {
          backgroundColor: isHovered
            ? "var(--button-background-hover)"
            : "transparent",
          color: "var(--button-background)",
          border: "none",
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

    // Intercept clicks if disabled
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (props.disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick && onClick(e);
    };

    return (
      <button
        ref={ref}
        style={{ ...baseStyle, ...style }}
        className={cn(
          sizeClasses,
          "rounded shadow transition-all hover:shadow-lg active:shadow-sm",
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={props.disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
