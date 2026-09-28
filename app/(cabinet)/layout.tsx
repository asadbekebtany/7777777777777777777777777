import { AppShell } from "@/components/shell/app-shell";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
