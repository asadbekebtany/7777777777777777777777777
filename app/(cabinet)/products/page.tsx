import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsView } from "@/components/views/products-view";
import { Skeleton } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Товары" };

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64" /></div>}>
      <ProductsView />
    </Suspense>
  );
}
