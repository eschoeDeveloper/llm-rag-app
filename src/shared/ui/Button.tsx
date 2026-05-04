type Props = {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "outline" | "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export function Button({
  children,
  onClick,
  disabled,
  type = "button",
  variant = "secondary",
  size = "md",
  className = "",
}: Props) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-matcha/40";

  const variants: Record<string, string> = {
    primary: "bg-matcha hover:bg-matcha-hover text-ink-on-accent",
    secondary: "bg-elevated hover:bg-muted text-ink border border-line",
    ghost: "bg-transparent hover:bg-muted text-ink",
    outline: "bg-transparent hover:bg-muted text-ink border border-line",
    default: "bg-elevated hover:bg-muted text-ink border border-line",
    success: "bg-matcha hover:bg-matcha-hover text-ink-on-accent",
    warning: "bg-soft-sand hover:bg-muted text-ink border border-line",
    danger: "bg-elevated hover:bg-muted text-ink border border-line",
  };

  const sizes: Record<string, string> = {
    sm: "h-7 px-2.5 text-xs rounded",
    md: "h-9 px-4 text-sm rounded-md",
    lg: "h-10 px-5 text-sm rounded-md",
    xl: "h-12 px-6 text-base rounded-md",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
