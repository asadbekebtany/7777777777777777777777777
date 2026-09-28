"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as Switch from "@radix-ui/react-switch";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-tawfiq-200 bg-white px-6 py-14 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045] text-tawfiq-800"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, currentColor 1px, transparent 1.4px), radial-gradient(circle at 80% 70%, currentColor 1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative mx-auto grid size-12 place-items-center rounded-2xl bg-tawfiq-50 text-tawfiq-700">{icon}</div>
      <h3 className="relative mt-4 text-base font-semibold">{title}</h3>
      {text && <p className="relative mx-auto mt-1 max-w-md text-sm text-muted">{text}</p>}
      {action && <div className="relative mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-tawfiq-100/80", className)} />;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-tawfiq-100 text-xs font-semibold text-tawfiq-800", className)}>
      {initials}
    </span>
  );
}

export function Pagination({
  page,
  pageCount,
  onPage,
  label,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  label: string;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-1 pt-3">
      <p className="text-xs text-muted">{label}</p>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-12 text-center text-sm tabular-nums">
          {page} / {pageCount}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)} aria-label="Next">
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function CheckBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean | "indeterminate";
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={(value) => onChange(value === true)}
      aria-label={label}
      className="grid size-4 place-items-center rounded border border-line bg-white data-[state=checked]:border-tawfiq-700 data-[state=checked]:bg-tawfiq-700 data-[state=indeterminate]:border-tawfiq-700 data-[state=indeterminate]:bg-tawfiq-700"
    >
      <Checkbox.Indicator>
        <Check className="size-3 text-white" />
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onChange}
      aria-label={label}
      className="relative h-6 w-11 rounded-full bg-[#d5ddd8] transition-colors data-[state=checked]:bg-tawfiq-700"
    >
      <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
    </Switch.Root>
  );
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: { id: string; title: string; description?: string; tone?: "success" | "danger" | "info" }[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-[min(100%-2rem,360px)] flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => onDismiss(toast.id)}
          className={cn(
            "pointer-events-auto rounded-xl border bg-white px-3 py-3 text-left shadow-card tawfiq-in",
            toast.tone === "danger" ? "border-danger/30" : "border-line",
          )}
        >
          <span className="block text-sm font-medium">{toast.title}</span>
          {toast.description && <span className="mt-0.5 block text-xs text-muted">{toast.description}</span>}
        </button>
      ))}
    </div>
  );
}

export function NotificationItem({
  unread,
  title,
  body,
  time,
  onClick,
}: {
  unread?: boolean;
  title: string;
  body: string;
  time: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={cn("flex w-full gap-3 rounded-xl px-2.5 py-2.5 text-left hover:bg-tawfiq-50", unread && "bg-tawfiq-50/70")}>
      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-tawfiq-600" : "bg-transparent")} />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted">{body}</span>
        <span className="mt-1 block text-[11px] text-muted">{time}</span>
      </span>
    </button>
  );
}
