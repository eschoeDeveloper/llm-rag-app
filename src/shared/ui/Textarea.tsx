import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
};

export function Textarea({ value, onChange, onKeyDown, placeholder, disabled, rows = 6 }: Props) {
  return (
    <textarea
      className="w-full rounded-xl border p-3 outline-none shadow-sm focus:ring-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      rows={rows}
    />
  );
}