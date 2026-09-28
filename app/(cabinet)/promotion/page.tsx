import type { Metadata } from "next";
import { PromotionView } from "@/components/views/promotion-view";

export const metadata: Metadata = { title: "Продвижение" };

export default function Page() {
  return <PromotionView />;
}
