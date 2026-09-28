import type { Metadata } from "next";
import { TeamView } from "@/components/views/team-view";

export const metadata: Metadata = { title: "Сотрудники" };

export default function Page() {
  return <TeamView />;
}
