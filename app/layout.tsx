import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SellerProvider } from "@/components/seller-provider";
import { TooltipProvider } from "@/components/ui/overlay";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Tawfiq Seller", template: "%s — Tawfiq Seller" },
  description: "Личный кабинет продавца Tawfiq: заказы, товары, деньги и Tawfiq AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="h-full bg-canvas font-sans text-ink antialiased">
        <SellerProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SellerProvider>
      </body>
    </html>
  );
}
