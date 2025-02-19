/**
 * File: src/components/ui/buttonVariants.ts
 * Description: Button variant definitions with an updated "icon" variant that removes background color.
 */
"use client";

import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-colors disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-7",
  ],
  {
    variants: {
      variant: {
        default: "bg-accent-6 text-white hover:bg-accent-7",
        solid: "bg-accent-6 text-white hover:bg-accent-7",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-accent-6 bg-background hover:bg-accent-1 hover:text-accent-9",
        secondary:
          "bg-gray-200 dark:bg-gray-700 text-foreground hover:bg-gray-300 dark:hover:bg-gray-600",
        ghost:
          "bg-transparent hover:bg-accent-1 hover:text-accent-9 dark:hover:bg-accent-2",
        link: "text-accent-9 underline-offset-4 hover:underline",
        // Updated icon variant: force transparent background and no border.
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
