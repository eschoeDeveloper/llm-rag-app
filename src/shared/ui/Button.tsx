type Props = {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "default" | "outline" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export function Button({ 
  children, 
  onClick, 
  disabled, 
  type = "button",
  variant = "default",
  size = "md",
  className = ""
}: Props) {
  const baseClasses = "font-semibold shadow-lg border-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-opacity-50";
  
  const variantClasses = {
    default: "bg-white hover:bg-gray-50 border-gray-300 text-gray-700 focus:ring-gray-200",
    outline: "bg-transparent hover:bg-gray-50 border-gray-300 text-gray-700 focus:ring-gray-200",
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-600 focus:ring-blue-200",
    secondary: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-purple-600 focus:ring-purple-200",
    success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 focus:ring-green-200",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-yellow-500 focus:ring-yellow-200",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-600 focus:ring-red-200"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-base rounded-xl",
    lg: "px-6 py-3 text-lg rounded-2xl",
    xl: "px-8 py-4 text-xl rounded-3xl"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
