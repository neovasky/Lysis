// src/components/ui/label.tsx
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <label className={`block text-sm font-medium ${className}`} {...props}>
    {children}
  </label>
);
export default Label;
