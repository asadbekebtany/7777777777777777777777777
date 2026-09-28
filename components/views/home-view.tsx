"use client";

import { PeriodPicker } from "@/components/period-picker";
import { SalesChart } from "@/components/sales-chart";
import { Screen } from "@/components/screen";
import { Ornament } from "@/components/ornament";
import { useSeller } from "@/components/seller-provider";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Segmented } from "@/components/ui/tabs";
import { fill } from "@/lib/i18n";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { buildChart, delta, selectPeriod, sumDays, TODAY } from "@/lib/metrics";
import type { MetricKey, PeriodKey } from "@/lib/types";
import { plural } from "@/lib/utils";
import { MessageSquare, Package, RotateCcw, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function HomeView() {
  const { t, locale, series, products, orders, returns, reviews } = useSeller();
  const [period, setPeriod] = useState<PeriodKey>("d7");
  const [range, setRange] = useState({ from: series[series.length - 7]?.date ?? TODAY, to: TODAY });
  const [metric, setMetric] = useState<MetricKey>("sales");
  const invalid = period === "custom" && range.from > range.to;
  const { current, previous } = selectPeriod(series, period, range);
  const now = sumDays(current);
  const before = sumDays(previous);
  const hint = {
    today: t.period.todayHint,
    yesterday: t.period.yesterdayHint,
    d7: t.period.d7Hint,
    d30: t.period.d30Hint,
    custom: t.period.customHint,
  }[period];
  const points = buildChart(current, previous, period, locale);
  const salesDelta = delta(now.sales, before.sales);
  const weak = products.filter((item) => item.status === "active" && item.views > 800 && item.sales / Math.max(item.views, 1) < 0.03);
  const risky = [...products].filter((item) => item.status === "active").sort((a, b) => b.returns - a.returns)[0];
  const newOrders = orders.filter((order) => order.status === "new").length;
  const attention = products.filter((item) => item.attention).length;
  const newReturns = returns.filter((item) => item.status === "new").length;
  const openReviews = reviews.filter((item) => !item.reply).length;

  const cards = [
    [t.home.sales, formatMoney(now.sales, locale), delta(now.sales, before.sales), false],
    [t.home.orders, formatNumber(now.orders, locale), delta(now.orders, before.orders), false],
    [t.home.items, formatNumber(now.items, locale), delta(now.items, before.items), false],
    [t.home.avg, formatMoney(now.avg, locale), delta(now.avg, before.avg), false],
    [t.home.returns, formatMoney(now.returnSum, locale), delta(now.returnSum, before.returnSum), true],
    [t.home.payout, formatMoney(now.payout, locale), delta(now.payout, before.payout), false],
  ] as const;

  return (
    <Screen
      title={t.home.title}
      subtitle={t.home.subtitle}
      actions={<PeriodPicker value={period} onChange={setPeriod} range={range} onRange={setRange} min={series[0]?.date} max={TODAY} />}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {cards.map(([label, value, change, invert]) => (
          <StatCard key={label} label={label} value={value} hint={hint} delta={change} deltaLabel={formatPercent(change, locale)} invert={invert} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">{t.home.chart}</h2>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-4 bg-tawfiq-700" />{t.home.current}</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-4 border-t border-dashed border-brass" />{t.home.previous}</span>
              </div>
            </div>
            <Segmented
              ariaLabel={t.home.metrics}
              value={metric}
              onChange={(id) => setMetric(id as MetricKey)}
              options={[
                { id: "sales", label: t.home.sales },
                { id: "orders", label: t.home.orders },
                { id: "items", label: t.home.items },
                { id: "avg", label: t.home.avg },
                { id: "returns", label: t.home.returns },
              ]}
            />
          </div>
          {invalid || points.length === 0 ? (
            <EmptyState title={invalid ? t.period.invalid : t.home.emptyChart} />
          ) : (
            <SalesChart
              points={points}
              metric={metric}
              locale={locale}
              labels={{ sales: t.home.sales, orders: t.home.orders, avg: t.home.avg, current: t.home.current, previous: t.home.previous }}
            />
          )}
        </Card>
        <section className="relative overflow-hidden rounded-2xl bg-tawfiq-800 p-5 text-white shadow-card xl:col-span-2">
          <Ornament className="pointer-events-none absolute inset-0 text-white opacity-[0.12]" />
          <div className="relative flex h-full flex-col">
            <p className="flex items-center gap-2 text-xs tracking-[0.16em] text-white/70">
              <Sparkles className="size-4 text-[#e4c99a]" />
              {t.home.aiKicker}
            </p>
            <h2 className="mt-3 text-lg font-semibold leading-snug">{t.home.aiTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/90">
              <li>{salesDelta != null && salesDelta > 1 ? fill(t.home.aiSalesUp, { value: formatPercent(salesDelta, locale) }) : salesDelta != null && salesDelta < -1 ? fill(t.home.aiSalesDown, { value: formatPercent(Math.abs(salesDelta), locale) }) : fill(t.home.aiSalesFlat, { value: formatPercent(salesDelta, locale) })}</li>
              {risky && <li>{fill(t.home.aiReturns, { name: risky.name })}</li>}
              {weak.length > 0 && <li>{fill(t.home.aiConversion, { name: weak.map((item) => item.name).join(locale === "en" ? "» and «" : locale === "uz" ? "» va «" : "» и «") })}</li>}
            </ul>
            <Button asChild variant="inverse" className="mt-5 w-fit">
              <Link href={`/ai?q=${encodeURIComponent(t.ai.prompts.growth)}`}>{t.home.aiButton}</Link>
            </Button>
          </div>
        </section>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Alert href="/orders?status=new" icon={<ShoppingBag className="size-4" />} title={`${newOrders} ${plural(newOrders, t.plurals.newOrders[0], t.plurals.newOrders[1], t.plurals.newOrders[2], locale)}`} text={t.home.alertOrdersHint} />
        <Alert href="/products?attention=1" icon={<Package className="size-4" />} title={`${attention} ${plural(attention, t.plurals.attention[0], t.plurals.attention[1], t.plurals.attention[2], locale)}`} text={t.home.alertProductsHint} />
        <Alert href="/returns?status=new" icon={<RotateCcw className="size-4" />} title={`${newReturns} ${plural(newReturns, t.plurals.newReturns[0], t.plurals.newReturns[1], t.plurals.newReturns[2], locale)}`} text={t.home.alertReturnsHint} />
        <Alert href="/reviews?tab=open" icon={<MessageSquare className="size-4" />} title={`${openReviews} ${plural(openReviews, t.plurals.openReviews[0], t.plurals.openReviews[1], t.plurals.openReviews[2], locale)}`} text={t.home.alertReviewsHint} />
      </div>
    </Screen>
  );
}

function Alert({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-card transition-colors hover:border-tawfiq-300 hover:bg-tawfiq-50/40">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tawfiq-50 text-tawfiq-800">{icon}</span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted">{text}</span>
      </span>
    </Link>
  );
}
