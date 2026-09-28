import type { Metadata } from "next";
import { Suspense } from "react";
import { ReturnsView } from "@/components/views/returns-view";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Возвраты" };

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64" /></div>}>
      <ReturnsView />
    </Suspense>
  );
}
