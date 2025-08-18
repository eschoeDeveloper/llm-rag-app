import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
};

export function Textarea({ value, onChange, placeholder, rows = 6 }: Props) {
  return (
    <textarea
      className="w-full rounded-xl border p-3 outline-none shadow-sm focus:ring-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}