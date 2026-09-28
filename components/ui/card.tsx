import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white shadow-card", padding && "p-4 sm:p-5", className)}>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  delta,
  deltaLabel,
  invert = false,
}: {
  label: string;
  value: string;
  hint?: string;
  delta: number | null;
  deltaLabel: string;
  invert?: boolean;
}) {
  const up = (delta ?? 0) > 0.05;
  const down = (delta ?? 0) < -0.05;
  const good = invert ? down : up;
  const bad = invert ? up : down;
  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-card transition-colors hover:border-tawfiq-200">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted">{label}</p>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
            good && "bg-tawfiq-50 text-tawfiq-800",
            bad && "bg-danger-soft text-danger",
            !good && !bad && "bg-canvas text-muted",
          )}
        >
          {up ? <ArrowUpRight className="size-3.5" /> : down ? <ArrowDownRight className="size-3.5" /> : <Minus className="size-3.5" />}
          {deltaLabel}
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-ink tabular-nums sm:text-[1.35rem]">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </article>
  );
}
