import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-canvas text-ink-soft",
  green: "bg-tawfiq-50 text-tawfiq-800",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  blue: "bg-info-soft text-info",
  brass: "bg-brass-soft text-[#7a5b32]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

const statusTone: Record<string, keyof typeof tones> = {
  new: "green",
  assembling: "amber",
  shipping: "blue",
  completed: "neutral",
  cancelled: "red",
  active: "green",
  moderation: "amber",
  rejected: "red",
  inactive: "neutral",
  review: "amber",
  approved: "green",
  paid: "green",
  pending: "amber",
  paused: "neutral",
  scheduled: "blue",
  ended: "neutral",
  draft: "brass",
  invited: "blue",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge tone={statusTone[status] ?? "neutral"}>{label}</Badge>;
}
