import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AIMessage({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(100%,680px)] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          role === "user" ? "bg-tawfiq-700 text-white" : "border border-line bg-white text-ink shadow-card",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AIActionCard({
  title,
  description,
  changes,
  lines,
  confirmLabel,
  cancelLabel,
  resolved,
  confirmedText,
  cancelledText,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  changes?: string[];
  lines?: { title: string; body: string }[];
  confirmLabel: string;
  cancelLabel: string;
  resolved?: "confirmed" | "cancelled";
  confirmedText: string;
  cancelledText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 rounded-xl border border-tawfiq-200 bg-tawfiq-50/50 p-3">
      <p className="text-sm font-medium text-tawfiq-900">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      {changes && (
        <ul className="mt-2 space-y-1 text-sm">
          {changes.map((item) => (
            <li key={item} className="rounded-lg bg-white px-2.5 py-1.5">
              {item}
            </li>
          ))}
        </ul>
      )}
      {lines && (
        <div className="mt-2 space-y-2">
          {lines.map((line) => (
            <div key={line.title} className="rounded-lg bg-white px-2.5 py-2">
              <p className="text-xs text-muted">{line.title}</p>
              <p className="mt-1 text-sm">{line.body}</p>
            </div>
          ))}
        </div>
      )}
      {resolved ? (
        <p className="mt-2 text-xs font-medium text-tawfiq-800">{resolved === "confirmed" ? confirmedText : cancelledText}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
