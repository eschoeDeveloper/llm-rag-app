type Props = {
  children?: React.ReactNode;
  title: string;
  right?: React.ReactNode;
};

export function Section({ title, children, right }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}