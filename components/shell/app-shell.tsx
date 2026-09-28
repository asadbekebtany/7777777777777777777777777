"use client";

import { useSeller } from "@/components/seller-provider";
import { Header } from "@/components/shell/header";
import { Sidebar } from "@/components/shell/sidebar";
import { ToastViewport } from "@/components/ui/feedback";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, toasts, dismissToast } = useSeller();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <div className="hidden lg:flex">
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label={t.nav.closeMenu} className="absolute inset-0 bg-[#14241c]/45" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-card">
            <Sidebar mobile onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setOpen(true)} />
        <main id="content" className="min-h-0 flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
