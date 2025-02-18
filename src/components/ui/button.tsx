// button.tsx
import { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "solid" | "icon"; // <-- Add "icon"
  size?: "default" | "icon"; // <-- If you want size="icon"
}

const Button: FC<ButtonProps> = ({
  variant = "solid",
  size = "default",
  className = "",
  children,
  ...props
}) => {
  // Base classes
  const baseClasses =
    "inline-flex items-center justify-center rounded transition-colors duration-200 focus:outline-none focus:ring-0";

  // Variant styles
  let variantClasses = "";
  if (variant === "outline") {
    // Outline style
    variantClasses =
      "border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white";
  } else if (variant === "solid") {
    // Solid style
    variantClasses = "bg-blue-500 text-white hover:bg-blue-600";
  } else if (variant === "icon") {
    variantClasses =
      "bg-transparent text-white border border-transparent hover:bg-white/10 hover:border-gray-300";
  }

  // Size styles
  let sizeClasses = "";
  if (size === "default") {
    sizeClasses = "px-4 py-2";
  } else if (size === "icon") {
    // Smaller padding, no forced width
    sizeClasses = "p-2 w-auto h-auto";
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
