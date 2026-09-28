"use client";

import { useSeller } from "@/components/seller-provider";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useSeller();
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">{t.error.title}</h1>
        <p className="mt-2 text-sm text-muted">{t.error.body}</p>
        <Button className="mt-5" onClick={reset}>{t.common.retry}</Button>
      </div>
    </div>
  );
}
