"use client";

import { useSeller } from "@/components/seller-provider";
import { Avatar, NotificationItem } from "@/components/ui/feedback";
import { Drawer, Menu, MenuItem, MenuLabel } from "@/components/ui/overlay";
import { IconButton } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { Bell, Check, ChevronDown, CircleHelp, LogOut, Menu as MenuIcon, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { t, locale, store, stores, setStoreId, notices, markAllNotices, markNotice, employees } = useSeller();
  const router = useRouter();
  const [help, setHelp] = useState(false);
  const owner = employees.find((person) => person.role === "owner");
  const unread = notices.filter((item) => !item.read).length;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:px-5">
      <IconButton label={t.nav.openMenu} className="lg:hidden" onClick={onMenu}>
        <MenuIcon className="size-5" />
      </IconButton>
      <Menu
        align="start"
        trigger={
          <button type="button" className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-canvas">
            <span className="grid size-8 place-items-center rounded-lg bg-tawfiq-800 text-xs font-semibold text-white">
              {store.name.slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{store.name}</span>
              <span className="block truncate text-xs text-muted">{store.city} · {store.focus[locale]}</span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted" />
          </button>
        }
      >
        <MenuLabel>{t.header.settings}</MenuLabel>
        {stores.map((item) => (
          <MenuItem key={item.id} onSelect={() => setStoreId(item.id)}>
            <span className="flex-1">{item.name}</span>
            {item.id === store.id && <Check className="size-4 text-tawfiq-700" />}
          </MenuItem>
        ))}
      </Menu>
      <div className="ml-auto flex items-center gap-1">
        <Popover.Root>
          <Popover.Trigger asChild>
            <IconButton label={t.header.notifications}>
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-tawfiq-700 px-1 text-[10px] text-white">
                  {unread}
                </span>
              )}
            </IconButton>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content align="end" sideOffset={8} className="z-50 w-[min(100vw-1.5rem,380px)] rounded-2xl border border-line bg-white p-2 shadow-card">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-sm font-medium">{t.header.notifications}</p>
                <button type="button" className="text-xs text-tawfiq-700 hover:underline" onClick={markAllNotices}>
                  {t.header.markAll}
                </button>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {notices.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted">{t.header.empty}</p>}
                {notices.map((item) => (
                  <NotificationItem
                    key={item.id}
                    unread={!item.read}
                    title={item.title[locale]}
                    body={item.body[locale]}
                    time={formatDateTime(item.createdAt, locale)}
                    onClick={() => {
                      markNotice(item.id);
                      router.push(item.href);
                    }}
                  />
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <IconButton label={t.header.help} onClick={() => setHelp(true)}>
          <CircleHelp className="size-5" />
        </IconButton>
        <Menu
          trigger={
            <button type="button" className="flex items-center gap-2 rounded-xl py-1 pr-1 pl-1 hover:bg-canvas">
              <Avatar name={owner?.name ?? store.name} />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium">{owner?.name}</span>
                <span className="block text-xs text-muted">{t.team.roles.owner}</span>
              </span>
            </button>
          }
        >
          <MenuLabel>{owner?.email}</MenuLabel>
          <MenuItem onSelect={() => router.push("/settings")}>
            <Settings className="size-4" /> {t.header.settings}
          </MenuItem>
          <MenuItem onSelect={() => router.push("/login")}>
            <LogOut className="size-4" /> {t.header.logout}
          </MenuItem>
        </Menu>
      </div>
      <Drawer open={help} onClose={() => setHelp(false)} title={t.help.title}>
        <div className="space-y-4 text-sm leading-relaxed">
          <HelpBlock title={t.help.ordersTitle} body={t.help.ordersBody} href="/orders" />
          <HelpBlock title={t.help.moneyTitle} body={t.help.moneyBody} href="/finance" />
          <HelpBlock title={t.help.aiTitle} body={t.help.aiBody} href="/ai" />
        </div>
      </Drawer>
    </header>
  );
}

function HelpBlock({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link href={href} className="block rounded-xl border border-line p-3 hover:border-tawfiq-300">
      <span className="font-medium">{title}</span>
      <span className="mt-1 block text-muted">{body}</span>
    </Link>
  );
}
