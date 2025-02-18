import { FC, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card: FC<CardProps> = ({ className = "", children, ...props }) => {
  return (
    <div className={`rounded shadow bg-white p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader: FC<CardHeaderProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`border-b pb-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle: FC<CardTitleProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <h2 className={`text-xl font-bold ${className}`} {...props}>
      {children}
    </h2>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent: FC<CardContentProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent };
