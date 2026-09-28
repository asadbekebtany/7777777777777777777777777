import { cn } from "@/lib/utils";

export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full min-w-[760px] border-collapse text-sm">{children}</table>;
}

export function Th({
  children,
  className,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <th className={cn("sticky top-0 z-10 border-b border-line bg-[#f7f8f6] px-3 py-2.5 text-left text-xs font-medium text-muted", className)}>
      {onClick ? (
        <Comp type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-ink">
          {children}
        </Comp>
      ) : (
        children
      )}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-line/80 px-3 py-3 align-middle text-ink", className)}>{children}</td>;
}
