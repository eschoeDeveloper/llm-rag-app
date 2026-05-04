type Props = {
  children?: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  className?: string;
};

export function Section({ title, children, right, className = "" }: Props) {
  return (
    <div className={`rounded-lg border border-line-subtle bg-elevated p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
