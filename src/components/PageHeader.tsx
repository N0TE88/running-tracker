export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-10 flex items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tighter">{title}</h1>
      </div>
      {children}
    </header>
  );
}
