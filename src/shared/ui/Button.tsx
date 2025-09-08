type Props = {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "default" | "outline" | "primary";
  size?: "sm" | "md" | "lg";
};

export function Button({ 
  children, 
  onClick, 
  disabled, 
  type = "button",
  variant = "default",
  size = "md"
}: Props) {
  const baseClasses = "rounded-xl shadow-sm border disabled:opacity-60 transition-colors";
  
  const variantClasses = {
    default: "bg-white hover:bg-gray-50 border-gray-300",
    outline: "bg-transparent hover:bg-gray-50 border-gray-300",
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
