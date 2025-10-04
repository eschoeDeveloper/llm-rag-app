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
  className = ""
}: Props) {
  return (
    <input
      className={`w-full rounded-2xl border-2 border-gray-200 p-3 text-gray-700 placeholder-gray-400 outline-none shadow-sm transition-all duration-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      min={min}
      max={max}
      step={step}
    />
  );
}