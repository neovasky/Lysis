// File: src/components/ui/buttonVariants.ts
"use client";

import { cva } from "class-variance-authority";

/**
 * buttonVariants: Applies accent background and hover states from your
 * theme variables (btn-accent, btn-accent-hover), along with other styles.
 */
export const buttonVariants = cva(
  [
    // Base styles (applies to all variants):
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-colors disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
    "shadow", // Always show a base shadow for button
  ],
  {
    variants: {
      variant: {
        /**
         * 'default' and 'solid' are effectively the same: accent background
         * with white text, plus a hover background of var(--btn-accent-hover).
         */
        default:
          "bg-[var(--btn-accent)] text-white hover:bg-[var(--btn-accent-hover)]",
        solid:
          "bg-[var(--btn-accent)] text-white hover:bg-[var(--btn-accent-hover)]",

        /**
         * 'destructive': used for dangerous actions, referencing your red color.
         * Adjust these references to match your own theme if needed.
         */
        destructive:
          "bg-[var(--color-red-600)] text-white hover:bg-[var(--color-red-700)]",

        /**
         * 'outline': Transparent background, accent border & text,
         * plus a hover that fills the background with accent-hover
         * and flips text to white.
         */
        outline:
          "border border-[var(--btn-accent)] bg-transparent text-[var(--btn-accent)] hover:bg-[var(--btn-accent-hover)] hover:text-white",

        /**
         * 'secondary': Typically a subtle background for less-primary actions.
         * Here it’s referencing gray tokens. Adjust as needed.
         */
        secondary:
          "bg-[var(--color-gray-200)] text-foreground hover:bg-[var(--color-gray-300)]",

        /**
         * 'ghost': Transparent background, accent text, and a hover that sets
         * background to accent-hover plus white text.
         */
        ghost:
          "bg-transparent text-[var(--btn-accent)] hover:bg-[var(--btn-accent-hover)] hover:text-white",

        /**
         * 'link': Just accent text with an underline on hover. For inline links.
         */
        link: "text-[var(--btn-accent)] underline-offset-4 hover:underline",

        /**
         * 'icon': Typically for icon-only buttons. Transparent background, no border,
         * and sets text to white by default. You can tweak if you want accent icons instead.
         */
        icon: "bg-transparent border-0 !bg-transparent text-white hover:bg-transparent hover:text-white",
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
