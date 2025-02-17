/**
 * File: src/components/ui/button.tsx
 * Description: Reusable button component using class variance authority for styling
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./buttonvariants";

// Minimal Slot implementation to support polymorphic 'asChild' behavior
const Slot = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  React.ComponentPropsWithoutRef<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
