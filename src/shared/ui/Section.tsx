type Props = {
  children?: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  className?: string;
};

export function Section({ title, children, right, className = "" }: Props) {
  return (
    <div className={`rounded-3xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm p-6 shadow-lg ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </div>
  );
}