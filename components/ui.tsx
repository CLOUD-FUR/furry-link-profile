import clsx from "clsx";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("mx-auto w-full max-w-5xl px-4", className)}>{children}</div>;
}

export function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border backdrop-blur-glass shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ButtonLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99] hover:scale-[1.01]",
        className
      )}
    >
      {children}
    </a>
  );
}
