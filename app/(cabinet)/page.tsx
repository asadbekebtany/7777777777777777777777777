import type { Metadata } from "next";
import { HomeView } from "@/components/views/home-view";

export const metadata: Metadata = { title: "Главная" };

export default function Page() {
  return <HomeView />;
}
