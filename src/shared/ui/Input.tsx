import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function Input({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  min,
  max,
  step,
  className = "",
  autoFocus,
  onKeyDown,
}: Props) {
  return (
    <input
      className={`w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-ink placeholder-ink-tertiary outline-none transition-colors focus:border-matcha focus:ring-2 focus:ring-matcha/30 disabled:bg-muted disabled:cursor-not-allowed ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      min={min}
      max={max}
      step={step}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
    />
  );
}
