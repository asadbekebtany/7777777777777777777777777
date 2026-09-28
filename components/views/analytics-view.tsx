"use client";

import { PeriodPicker } from "@/components/period-picker";
import { SalesChart } from "@/components/sales-chart";
import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { Card, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/tabs";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { buildChart, customersFrom, delta, funnelFrom, REGIONS, selectPeriod, sumDays, TODAY } from "@/lib/metrics";
import type { MetricKey, PeriodKey } from "@/lib/types";
import { useState } from "react";

export function AnalyticsView() {
  const { t, locale, series, products } = useSeller();
  const [section, setSection] = useState("sales");
  const [period, setPeriod] = useState<PeriodKey>("d30");
  const [range, setRange] = useState({ from: series[series.length - 30]?.date ?? TODAY, to: TODAY });
  const [metric, setMetric] = useState<MetricKey>("sales");
  const invalid = period === "custom" && range.from > range.to;
  const { current, previous } = selectPeriod(series, period, range);
  const now = sumDays(current);
  const before = sumDays(previous);
  const points = buildChart(current, previous, period, locale);
  const funnel = funnelFrom(now.orders);
  const buyers = customersFrom(now.orders);
  const leaders = [...products].filter((item) => item.status === "active").sort((a, b) => b.sales - a.sales).slice(0, 5);
  const falling = [...products].filter((item) => item.trend < 0).sort((a, b) => a.trend - b.trend).slice(0, 5);
  const growing = [...products].filter((item) => item.trend > 0).sort((a, b) => b.trend - a.trend).slice(0, 5);
  const labels = { impressions: t.analytics.impressions, opens: t.analytics.opens, cart: t.analytics.cart, orders: t.analytics.orders, purchases: t.analytics.purchases };

  return (
    <Screen title={t.analytics.title} subtitle={t.analytics.subtitle} actions={<PeriodPicker value={period} onChange={setPeriod} range={range} onRange={setRange} min={series[0]?.date} max={TODAY} />}>
      <Segmented
        ariaLabel={t.analytics.title}
        value={section}
        onChange={setSection}
        options={[
          { id: "sales", label: t.analytics.sales },
          { id: "products", label: t.analytics.products },
          { id: "funnel", label: t.analytics.funnel },
          { id: "customers", label: t.analytics.customers },
          { id: "geo", label: t.analytics.geo },
        ]}
      />
      {invalid || current.length === 0 ? <EmptyState title={invalid ? t.period.invalid : t.analytics.empty} /> : (
        <>
          {section === "sales" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <StatCard label={t.analytics.sales} value={formatMoney(now.sales, locale)} hint={t.period.customHint} delta={delta(now.sales, before.sales)} deltaLabel={formatPercent(delta(now.sales, before.sales), locale)} />
                <StatCard label={t.analytics.orders} value={formatNumber(now.orders, locale)} hint={t.period.customHint} delta={delta(now.orders, before.orders)} deltaLabel={formatPercent(delta(now.orders, before.orders), locale)} />
                <StatCard label={t.analytics.avg} value={formatMoney(now.avg, locale)} hint={t.period.customHint} delta={delta(now.avg, before.avg)} deltaLabel={formatPercent(delta(now.avg, before.avg), locale)} />
              </div>
              <Card>
                <Segmented ariaLabel={t.home.metrics} value={metric} onChange={(id) => setMetric(id as MetricKey)} options={[{ id: "sales", label: t.home.sales }, { id: "orders", label: t.home.orders }, { id: "avg", label: t.home.avg }]} />
                <div className="mt-4">
                  <SalesChart points={points} metric={metric} locale={locale} labels={{ sales: t.home.sales, orders: t.home.orders, avg: t.home.avg, current: t.home.current, previous: t.home.previous }} />
                </div>
              </Card>
            </div>
          )}
          {section === "products" && (
            <div className="grid gap-4 lg:grid-cols-3">
              <Rank title={t.analytics.leaders} rows={leaders.map((item) => ({ name: item.name, value: `${formatNumber(item.sales, locale)} ${t.analytics.units}`, tone: "text-ink" }))} />
              <Rank title={t.analytics.falling} rows={falling.map((item) => ({ name: item.name, value: formatPercent(item.trend, locale), tone: "text-danger" }))} />
              <Rank title={t.analytics.growing} rows={growing.map((item) => ({ name: item.name, value: formatPercent(item.trend, locale), tone: "text-tawfiq-800" }))} />
            </div>
          )}
          {section === "funnel" && (
            <Card>
              <ol className="space-y-3">
                {funnel.map((step, index) => {
                  const prev = funnel[index - 1];
                  const rate = prev ? (step.value / prev.value) * 100 : 100;
                  const width = Math.max(18, (step.value / funnel[0].value) * 100);
                  return (
                    <li key={step.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{labels[step.key]}</span>
                        <span className="tabular-nums text-muted">{formatNumber(step.value, locale)}{index > 0 && ` · ${formatPercent(rate, locale)} ${t.analytics.cr}`}</span>
                      </div>
                      <div className="h-9 rounded-lg bg-tawfiq-50">
                        <div className="h-full rounded-lg bg-tawfiq-600/80" style={{ width: `${width}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          )}
          {section === "customers" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <StatCard label={t.analytics.totalBuyers} value={formatNumber(buyers.total, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
                <StatCard label={t.analytics.newBuyers} value={formatNumber(buyers.fresh, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
                <StatCard label={t.analytics.returning} value={formatNumber(buyers.returning, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
              </div>
              <Card>
                <div className="flex h-4 overflow-hidden rounded-full">
                  <div className="bg-tawfiq-700" style={{ width: `${(buyers.fresh / buyers.total) * 100}%` }} />
                  <div className="bg-brass" style={{ width: `${(buyers.returning / buyers.total) * 100}%` }} />
                </div>
                <div className="mt-3 flex gap-4 text-sm">
                  <span className="text-tawfiq-800">{t.analytics.newBuyers}</span>
                  <span className="text-[#7a5b32]">{t.analytics.returning}</span>
                </div>
              </Card>
            </div>
          )}
          {section === "geo" && (
            <Card>
              <h2 className="mb-4 font-semibold">{t.analytics.geoTitle}</h2>
              <ul className="space-y-3">
                {REGIONS.map((region) => (
                  <li key={region.name.ru}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{region.name[locale]}</span>
                      <span className="tabular-nums text-muted">{formatMoney(Math.round(now.sales * region.share), locale)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-canvas">
                      <div className="h-full rounded-full bg-tawfiq-600" style={{ width: `${region.share / REGIONS[0].share * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
      <p className="text-sm text-muted">{t.analytics.warehouse}</p>
    </Screen>
  );
}

function Rank({ title, rows }: { title: string; rows: { name: string; value: string; tone: string }[] }) {
  return (
    <Card>
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-3 space-y-3">
        {rows.map((row, index) => (
          <li key={row.name} className="flex items-start justify-between gap-3 text-sm">
            <span><span className="mr-2 text-muted">{index + 1}</span>{row.name}</span>
            <span className={`shrink-0 tabular-nums ${row.tone}`}>{row.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
