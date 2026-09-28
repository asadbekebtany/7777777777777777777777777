import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsView } from "@/components/views/settings-view";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Настройки" };

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64" /></div>}>
      <SettingsView />
    </Suspense>
  );
}
