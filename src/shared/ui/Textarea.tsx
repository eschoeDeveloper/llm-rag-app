import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
};

export function Textarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  rows = 6,
  className = "",
}: Props) {
  return (
    <textarea
      className={`w-full rounded-md border border-line bg-elevated p-3 text-sm text-ink placeholder-ink-tertiary outline-none transition-colors focus:border-matcha focus:ring-2 focus:ring-matcha/30 disabled:bg-muted disabled:cursor-not-allowed resize-none ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      rows={rows}
    />
  );
}
