import { FC, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card: FC<CardProps> = ({ className = "", children, ...props }) => (
  <div
    style={{
      backgroundColor: "var(--card-background)",
      color: "var(--text-card)", // Use our card text color token
      borderColor: "var(--card-border)",
    }}
    className={`rounded shadow p-4 border ${className}`}
    {...props}
  >
    {children}
  </div>
);

export { Card };
