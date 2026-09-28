"use client";

import { Wordmark } from "@/components/brand";
import { Ornament } from "@/components/ornament";
import { useSeller } from "@/components/seller-provider";
import { Tooltip } from "@/components/ui/overlay";
import { cn } from "@/lib/utils";
import {
  ChartLine,
  LayoutDashboard,
  Megaphone,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { t, collapsed, setCollapsed, orders, returns, reviews } = useSeller();
  const pathname = usePathname();
  const narrow = !mobile && collapsed;
  const badges: Record<string, number> = {
    "/orders": orders.filter((order) => order.status === "new").length,
    "/returns": returns.filter((item) => item.status === "new").length,
    "/reviews": reviews.filter((review) => !review.reply).length,
  };
  const items = [
    { href: "/", label: t.nav.home, icon: LayoutDashboard },
    { href: "/orders", label: t.nav.orders, icon: ShoppingBag },
    { href: "/products", label: t.nav.products, icon: Package },
    { href: "/returns", label: t.nav.returns, icon: RotateCcw },
    { href: "/promotion", label: t.nav.promotion, icon: Megaphone },
    { href: "/analytics", label: t.nav.analytics, icon: ChartLine },
    { href: "/finance", label: t.nav.finance, icon: Wallet },
    { href: "/reviews", label: t.nav.reviews, icon: Star },
    { href: "/team", label: t.nav.team, icon: Users },
    { href: "/ai", label: t.nav.ai, icon: Sparkles },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className={cn("relative flex h-full flex-col bg-tawfiq-800 text-white", narrow ? "w-[84px]" : "w-[264px]")}>
      <Ornament className="pointer-events-none absolute inset-0 text-white opacity-[0.08]" />
      <div className={cn("relative flex h-16 items-center", narrow ? "justify-center px-2" : "px-4")}>
        <Link href="/" aria-label="Tawfiq Seller">
          <Wordmark light collapsed={narrow} seller={t.brand.seller} />
        </Link>
      </div>
      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const count = badges[item.href] ?? 0;
          const link = (
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#d7ebe3] transition-colors hover:bg-white/8 hover:text-white",
                active && "bg-[#1b6b52] text-white",
                narrow && "justify-center px-0",
              )}
            >
              {active && <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#d7b98a]" />}
              <item.icon className={cn("size-[18px] shrink-0", item.href === "/ai" && "text-[#e4c99a]")} />
              {!narrow && <span className="truncate">{item.label}</span>}
              {!narrow && count > 0 && (
                <span className="ml-auto rounded-full bg-white/15 px-1.5 text-[11px] text-white tabular-nums">{count}</span>
              )}
              {narrow && count > 0 && <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-[#e4c99a]" />}
            </Link>
          );
          return narrow ? (
            <Tooltip key={item.href} label={item.label}>
              {link}
            </Tooltip>
          ) : (
            <div key={item.href}>{link}</div>
          );
        })}
      </nav>
      {!mobile && (
        <div className="relative p-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-[#d7ebe3] hover:bg-white/8"
          >
            {narrow ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!narrow && <span>{t.nav.collapse}</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
