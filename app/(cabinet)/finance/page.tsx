import type { Metadata } from "next";
import { Suspense } from "react";
import { FinanceView } from "@/components/views/finance-view";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Финансы" };

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64" /></div>}>
      <FinanceView />
    </Suspense>
  );
}
