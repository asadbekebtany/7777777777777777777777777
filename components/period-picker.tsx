"use client";

import { DateRangePicker } from "@/components/ui/field";
import { Segmented } from "@/components/ui/tabs";
import { useSeller } from "@/components/seller-provider";
import type { PeriodKey } from "@/lib/types";

export function PeriodPicker({
  value,
  onChange,
  range,
  onRange,
  min,
  max,
}: {
  value: PeriodKey;
  onChange: (value: PeriodKey) => void;
  range: { from: string; to: string };
  onRange: (range: { from: string; to: string }) => void;
  min?: string;
  max?: string;
}) {
  const { t } = useSeller();
  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Segmented
        ariaLabel={t.period.aria}
        value={value}
        onChange={(id) => onChange(id as PeriodKey)}
        options={[
          { id: "today", label: t.period.today },
          { id: "yesterday", label: t.period.yesterday },
          { id: "d7", label: t.period.d7 },
          { id: "d30", label: t.period.d30 },
          { id: "custom", label: t.period.custom },
        ]}
      />
      {value === "custom" && (
        <div className="w-full sm:w-[280px]">
          <DateRangePicker fromLabel={t.period.from} toLabel={t.period.to} from={range.from} to={range.to} min={min} max={max} onChange={onRange} />
        </div>
      )}
    </div>
  );
}
