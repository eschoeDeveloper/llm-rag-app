import React from "react";

type ChipProps = {
  children: React.ReactNode;
  variant?: "default" | "accent" | "soft";
  size?: "sm" | "md";
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

/**
 * 작은 라벨 / 토글 버튼 양쪽 용도.
 * onClick 이 있으면 button 으로 렌더 (포커스링 + 키보드 접근성).
 * active=true 면 variant="accent" 강제.
 */
export const Chip = ({
  children,
  variant = "default",
  size = "sm",
  active,
  onClick,
  className = "",
}: ChipProps) => {
  const base = "inline-flex items-center font-medium transition-colors";
  const effectiveVariant = active ? "accent" : variant;
  const variants = {
    default: "bg-elevated text-ink-secondary border border-line-subtle",
    accent: "bg-matcha text-ink-on-accent",
    soft: "bg-matcha-soft text-matcha-hover",
  };
  const interactive = onClick
    ? "cursor-pointer hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-matcha/40"
    : "";
  const sizes = {
    sm: "px-2 py-0.5 text-xs rounded",
    md: "px-2.5 py-1 text-sm rounded",
  };
  const cls = `${base} ${variants[effectiveVariant]} ${sizes[size]} ${interactive} ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }
  return <span className={cls}>{children}</span>;
};
