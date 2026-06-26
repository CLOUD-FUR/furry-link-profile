import clsx from "clsx";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("mx-auto w-full max-w-6xl px-5 sm:px-6", className)}>{children}</div>;
}

export function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={clsx(
        "rounded-3xl border backdrop-blur-glass shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:border-white dark:hover:bg-slate-100 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.45)]",
  secondary:
    "bg-white/80 text-slate-900 border-white/70 hover:bg-white dark:bg-white/10 dark:text-slate-100 dark:border-white/20 dark:hover:bg-white/20 backdrop-blur",
  ghost:
    "bg-transparent text-slate-700 border-transparent hover:bg-white/40 dark:text-slate-200 dark:hover:bg-white/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function ButtonLink({
  href,
  className,
  children,
  variant = "secondary",
  size = "md",
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <a
      href={href}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      {children}
    </a>
  );
}
