/**
 * File: src/components/ui/buttonVariants.ts
 * Description: Button variant definitions using correct theme color variables
 */
"use client";

import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-colors disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-blue-600)] text-white hover:bg-[var(--color-blue-700)]",
        solid:
          "bg-[var(--color-blue-600)] text-white hover:bg-[var(--color-blue-700)]",
        destructive:
          "bg-[var(--color-red-600)] text-white hover:bg-[var(--color-red-700)]",
        outline:
          "border border-[var(--color-blue-600)] bg-transparent hover:bg-[var(--color-blue-100)] hover:text-[var(--color-blue-900)]",
        secondary:
          "bg-[var(--color-gray-200)] text-foreground hover:bg-[var(--color-gray-300)]",
        ghost:
          "hover:bg-[var(--color-blue-100)] hover:text-[var(--color-blue-900)]",
        link: "text-[var(--color-blue-600)] underline-offset-4 hover:underline",
        icon: "bg-transparent border-0 !bg-transparent text-foreground hover:bg-transparent hover:text-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
