import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tawfiq-600/35",
  {
    variants: {
      variant: {
        primary: "bg-tawfiq-700 text-white hover:bg-tawfiq-800",
        secondary: "border border-line bg-white text-ink hover:bg-tawfiq-50",
        ghost: "text-ink-soft hover:bg-tawfiq-50",
        danger: "bg-danger text-white hover:bg-[#9c1e15]",
        inverse: "bg-white text-tawfiq-800 hover:bg-tawfiq-50",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-3.5 text-sm",
        lg: "h-11 px-4 text-sm",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  type,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonStyles> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonStyles({ variant, size }), className)}
      type={asChild ? undefined : type ?? "button"}
      {...props}
    />
  );
}

export function IconButton({
  className,
  label,
  children,
  variant = "ghost",
  ...props
}: React.ComponentProps<"button"> & { label: string; variant?: "ghost" | "secondary" }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-xl text-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tawfiq-600/35",
        variant === "secondary" ? "border border-line bg-white hover:bg-tawfiq-50" : "hover:bg-tawfiq-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
