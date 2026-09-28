import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M8 11.5h16M16 11.5V23"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M16 6.2l1.35 2.05h-2.7L16 6.2z" fill="#C6A36A" />
    </svg>
  );
}

export function Wordmark({
  light = false,
  collapsed = false,
  seller,
}: {
  light?: boolean;
  collapsed?: boolean;
  seller: string;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          light ? "bg-white/10 text-white" : "bg-tawfiq-800 text-white",
        )}
      >
        <Mark className="size-6" />
      </span>
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className={cn("block text-[15px] font-semibold tracking-[0.14em]", light ? "text-white" : "text-ink")}>
            TAWFIQ
          </span>
          <span className={cn("block text-[11px] uppercase tracking-[0.16em]", light ? "text-white/65" : "text-muted")}>
            {seller}
          </span>
        </span>
      )}
    </span>
  );
}
