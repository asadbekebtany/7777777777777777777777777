import type { ThumbKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductThumb({ kind, className, alt }: { kind: ThumbKind; className?: string; alt: string }) {
  return (
    <span className={cn("grid place-items-center overflow-hidden rounded-xl bg-[#eef4f1]", className)} role="img" aria-label={alt}>
      <ThumbSvg kind={kind} />
    </span>
  );
}

function ThumbSvg({ kind }: { kind: ThumbKind }) {
  return (
    <svg viewBox="0 0 64 64" className="size-10 text-tawfiq-800" aria-hidden>
      {kind === "brakes" && <path d="M14 32h36M18 24h28v16H18z" fill="none" stroke="currentColor" strokeWidth="2" />}
      {kind === "filter" && <path d="M20 16h24l4 8v24H16V24z M22 32h20M22 38h20" fill="none" stroke="currentColor" strokeWidth="2" />}
      {kind === "shock" && <path d="M32 10v8M26 18h12v8l-4 22h-4l-4-22z M24 48h16" fill="none" stroke="currentColor" strokeWidth="2" />}
      {kind === "spark" && <path d="M28 10h8v10l6 6v8H22v-8l6-6z M30 42h4v10" fill="none" stroke="currentColor" strokeWidth="2" />}
      {kind === "tire" && <><circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="6" /><circle cx="32" cy="32" r="4" fill="currentColor" /></>}
      {kind === "wheel" && <><circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M32 16v32M16 32h32M20 20l24 24M44 20L20 44" stroke="currentColor" strokeWidth="1.5" /></>}
      {kind === "bearing" && <><circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="32" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="2" /></>}
      {kind === "belt" && <path d="M16 24c10 0 10 16 20 16h12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />}
      {kind === "bushing" && <path d="M18 26h28v12H18z M24 26v-6h16v6M24 38v6h16v-6" fill="none" stroke="currentColor" strokeWidth="2" />}
      {kind === "mat" && <path d="M16 20h32v24H16z M20 28h24M20 34h16" fill="none" stroke="currentColor" strokeWidth="2" />}
      {kind === "oil" && <path d="M26 14h12l2 8v22a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V22z" fill="none" stroke="currentColor" strokeWidth="2" />}
      {kind === "sensor" && <path d="M24 18h16v10H24z M32 28v8 M22 44h20" fill="none" stroke="currentColor" strokeWidth="2" />}
      {kind === "valve" && <path d="M32 12v28 M24 40h16 M28 18h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      {kind === "disc" && <><circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="32" cy="32" r="6" fill="none" stroke="currentColor" strokeWidth="2" /></>}
    </svg>
  );
}
