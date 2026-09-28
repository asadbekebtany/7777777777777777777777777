"use client";

import { formatCompact, formatMoney, formatNumber } from "@/lib/format";
import type { ChartPoint, Locale, MetricKey } from "@/lib/types";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const fields: Record<MetricKey, { current: keyof ChartPoint; previous: keyof ChartPoint }> = {
  sales: { current: "sales", previous: "prevSales" },
  orders: { current: "orders", previous: "prevOrders" },
  items: { current: "items", previous: "prevItems" },
  avg: { current: "avg", previous: "prevAvg" },
  returns: { current: "returns", previous: "prevReturns" },
};

export function SalesChart({
  points,
  metric,
  locale,
  labels,
}: {
  points: ChartPoint[];
  metric: MetricKey;
  locale: Locale;
  labels: { sales: string; orders: string; avg: string; current: string; previous: string };
}) {
  const field = fields[metric];
  const money = metric === "sales" || metric === "avg" || metric === "returns";
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tawfiq-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#126b50" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#126b50" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e6ebe7" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#5e7067", fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis
            tick={{ fill: "#5e7067", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value: number) => (money ? formatCompact(value, locale) : formatNumber(value, locale))}
          />
          <Tooltip
            cursor={{ stroke: "#c9e8db" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as ChartPoint;
              return (
                <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-card">
                  <p className="font-medium text-ink">{point.fullDate}</p>
                  <p className="mt-1 text-ink-soft">{labels.sales}: {formatMoney(point.sales, locale)}</p>
                  <p className="text-ink-soft">{labels.orders}: {formatNumber(point.orders, locale)}</p>
                  <p className="text-ink-soft">{labels.avg}: {formatMoney(point.avg, locale)}</p>
                  <p className="mt-1 text-muted">{labels.previous}: {money ? formatMoney(Number(point[field.previous]), locale) : formatNumber(Number(point[field.previous]), locale)}</p>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey={field.current} stroke="#126b50" strokeWidth={2} fill="url(#tawfiq-area)" dot={points.length < 3} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey={field.previous} stroke="#a68556" strokeDasharray="4 4" strokeWidth={1.6} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
