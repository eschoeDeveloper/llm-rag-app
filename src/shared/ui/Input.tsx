type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
};

export function Input({ value, onChange, placeholder, type = "text" }: Props) {
  return (
    <input
      className="w-full rounded-xl border p-3 outline-none shadow-sm focus:ring-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
}