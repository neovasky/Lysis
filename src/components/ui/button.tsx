import { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "solid";
}

const Button: FC<ButtonProps> = ({
  variant = "solid",
  className = "",
  children,
  ...props
}) => {
  const baseClasses = "px-4 py-2 rounded focus:outline-none";
  const variantClasses =
    variant === "outline"
      ? "border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
      : "bg-blue-500 text-white hover:bg-blue-600";
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
