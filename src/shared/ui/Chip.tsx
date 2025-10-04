type ChipProps = {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const Chip = ({ 
  children, 
  variant = "default", 
  size = "md",
  className = ""
}: ChipProps) => {
  const baseClasses = "inline-flex items-center font-medium transition-all duration-200 transform hover:scale-105";
  
  const variantClasses = {
    default: "bg-white border border-gray-300 text-gray-700 shadow-sm",
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md",
    secondary: "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-md",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md",
    info: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 shadow-md"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs rounded-full",
    md: "px-3 py-1.5 text-sm rounded-full",
    lg: "px-4 py-2 text-base rounded-full"
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};