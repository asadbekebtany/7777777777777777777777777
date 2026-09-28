"use client";

import { ProductThumb } from "@/components/product-thumb";
import type { ThumbKind } from "@/lib/types";
import { useState } from "react";

export function PhotoCompare({ kind, before, after }: { kind: ThumbKind; before: string; after: string }) {
  const [pos, setPos] = useState(58);
  return (
    <div>
      <div className="relative h-52 overflow-hidden rounded-xl border border-line">
        <div className="absolute inset-0 grid place-items-center bg-white">
          <ProductThumb kind={kind} alt={after} className="size-28 bg-white" />
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#efe4d4,transparent_40%),linear-gradient(160deg,#d9cfc2,#b7c3bb)]">
            <span className="rotate-6 opacity-90 drop-shadow">
              <ProductThumb kind={kind} alt={before} className="size-24 bg-transparent" />
            </span>
          </div>
        </div>
        <div className="absolute inset-y-0 w-px bg-white" style={{ left: `${pos}%` }} />
        <span className="absolute top-2 left-2 rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white">{before}</span>
        <span className="absolute top-2 right-2 rounded-full bg-tawfiq-800/80 px-2 py-0.5 text-[11px] text-white">{after}</span>
      </div>
      <input
        aria-label={`${before} / ${after}`}
        className="mt-3 w-full accent-tawfiq-700"
        type="range"
        min={8}
        max={92}
        value={pos}
        onChange={(event) => setPos(Number(event.target.value))}
      />
    </div>
  );
}
