"use client";

import { useId } from "react";

export function Ornament({ className }: { className?: string }) {
  const raw = useId().replace(/:/g, "");
  const id = `uz-${raw}`;
  return (
    <svg className={className} aria-hidden>
      <defs>
        <pattern id={id} width="72" height="72" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="28" y="28" width="16" height="16" />
            <rect x="28" y="28" width="16" height="16" transform="rotate(45 36 36)" />
            <path d="M36 18v8M36 46v8M18 36h8M46 36h8" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="64" cy="64" r="1.2" fill="currentColor" stroke="none" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
