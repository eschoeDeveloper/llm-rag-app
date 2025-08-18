type Props = {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function Button({ children, onClick, disabled, type = "button" }: Props) {
  return (
    <button
      className="rounded-xl px-4 py-2 shadow-sm border bg-white hover:bg-gray-50 disabled:opacity-60"
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
