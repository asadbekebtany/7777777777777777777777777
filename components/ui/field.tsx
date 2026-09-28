"use client";

import { Check, ChevronDown, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-tawfiq-400 focus:ring-2 focus:ring-tawfiq-600/15",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-tawfiq-400 focus:ring-2 focus:ring-tawfiq-600/15",
        className,
      )}
      {...props}
    />
  );
}

export function Search({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-line bg-white pr-3 pl-9 text-sm outline-none placeholder:text-muted focus:border-tawfiq-400 focus:ring-2 focus:ring-tawfiq-600/15"
      />
    </label>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 text-left text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tawfiq-600/30"
      >
        <span className={cn("truncate", !current && "text-muted")}>{current?.label ?? placeholder}</span>
        <ChevronDown className="size-4 shrink-0 text-muted" />
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-30 cursor-default" aria-label={ariaLabel} onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-1 max-h-64 w-full min-w-[180px] overflow-auto rounded-xl border border-line bg-white p-1 shadow-card">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-tawfiq-50"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check className="size-4 text-tawfiq-700" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-tawfiq-400 focus:ring-2 focus:ring-tawfiq-600/15"
      />
    </label>
  );
}

export function DateRangePicker({
  fromLabel,
  toLabel,
  from,
  to,
  onChange,
  min,
  max,
}: {
  fromLabel: string;
  toLabel: string;
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  min?: string;
  max?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePicker label={fromLabel} value={from} min={min} max={max} onChange={(value) => onChange({ from: value, to })} />
      <DatePicker label={toLabel} value={to} min={min} max={max} onChange={(value) => onChange({ from, to: value })} />
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-ink-soft">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
