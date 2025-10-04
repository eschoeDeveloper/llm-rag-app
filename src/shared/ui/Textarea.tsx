import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
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
  className = ""
}: Props) {
  return (
    <textarea
      className={`w-full rounded-2xl border-2 border-gray-200 p-4 text-gray-700 placeholder-gray-400 outline-none shadow-sm transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      rows={rows}
    />
  );
}