"use client";

import { Wordmark } from "@/components/brand";
import { Ornament } from "@/components/ornament";
import { useSeller } from "@/components/seller-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  const { t } = useSeller();
  return (
    <div className="relative grid min-h-dvh place-items-center bg-canvas px-4">
      <Ornament className="pointer-events-none absolute inset-0 text-tawfiq-800 opacity-[0.05]" />
      <div className="relative max-w-md text-center">
        <div className="mb-6 flex justify-center"><Wordmark seller={t.brand.seller} /></div>
        <h1 className="text-2xl font-semibold">{t.notFound.title}</h1>
        <p className="mt-2 text-sm text-muted">{t.notFound.body}</p>
        <Button asChild className="mt-5"><Link href="/">{t.common.backHome}</Link></Button>
      </div>
    </div>
  );
}
