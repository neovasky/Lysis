import { FC, LabelHTMLAttributes } from "react";

const Label: FC<LabelHTMLAttributes<HTMLLabelElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <label className={`block text-sm font-medium ${className}`} {...props}>
    {children}
  </label>
);

export default Label;
