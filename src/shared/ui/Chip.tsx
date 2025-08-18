type ChipProps = {
  children: React.ReactNode;
};

export const Chip = ({ children }: ChipProps) => (
  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs bg-white">
    {children}
  </span>
);