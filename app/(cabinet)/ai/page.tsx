import type { Metadata } from "next";
import { Suspense } from "react";
import { AiView } from "@/components/views/ai-view";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Tawfiq AI" };

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64" /></div>}>
      <AiView />
    </Suspense>
  );
}
