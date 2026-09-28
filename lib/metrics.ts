import { addIsoDays, formatClock, formatDay, formatDayLong } from "@/lib/format";
import type { ChartPoint, DayPoint, Locale, PeriodKey } from "@/lib/types";

export const RATES = {
  commission: 0.09,
  logistics: 0.01,
  placement: 0.005,
};

export const TODAY = "2026-09-28";

const HOUR_WEIGHTS = [4, 5, 6, 7, 8, 9, 10, 9, 8, 8, 7, 7, 6, 6];

export function delta(current: number, previous: number) {
  if (!previous) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function sumDays(days: DayPoint[]) {
  const sales = days.reduce((s, d) => s + d.sales, 0);
  const orders = days.reduce((s, d) => s + d.orders, 0);
  const items = days.reduce((s, d) => s + d.items, 0);
  const returnCount = days.reduce((s, d) => s + d.returnCount, 0);
  const returnSum = days.reduce((s, d) => s + d.returnSum, 0);
  const avg = orders ? Math.round(sales / orders) : 0;
  const commission = Math.round(sales * RATES.commission);
  const logistics = Math.round(sales * RATES.logistics);
  const placement = Math.round(sales * RATES.placement);
  const services = logistics + placement;
  const fees = commission + services;
  const payout = sales - returnSum - fees;
  return {
    sales,
    orders,
    items,
    returnCount,
    returnSum,
    avg,
    commission,
    logistics,
    placement,
    services,
    fees,
    payout,
  };
}

export function buildSeries(seed: number, base: number, ticket: number): DayPoint[] {
  const start = "2026-07-31";
  const days: DayPoint[] = [];
  for (let i = 0; i < 60; i++) {
    const date = addIsoDays(start, i);
    const dow = new Date(`${date}T12:00:00+05:00`).getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 0.8 : 1;
    const wave = 0.88 + unit(seed * 50 + i) * 0.28;
    const trend = 0.94 + i * 0.0022;
    const sales = Math.round(base * weekend * wave * trend);
    const orders = Math.max(4, Math.round(sales / (ticket * (0.9 + unit(i + seed) * 0.22))));
    const items = orders + Math.round(orders * (0.18 + unit(i * 3 + seed) * 0.42));
    const returnCount = unit(i * 7 + seed) > 0.74 ? 1 + (unit(i + 4) > 0.65 ? 1 : 0) : 0;
    const returnSum = returnCount * Math.round(ticket * (0.35 + unit(i + 11) * 0.7));
    days.push({ date, sales, orders, items, returnCount, returnSum });
  }
  return days;
}

function unit(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function selectPeriod(
  series: DayPoint[],
  key: PeriodKey,
  range: { from: string; to: string },
) {
  let current: DayPoint[] = [];
  if (key === "today") current = series.filter((d) => d.date === TODAY);
  else if (key === "yesterday") current = series.filter((d) => d.date === addIsoDays(TODAY, -1));
  else if (key === "d7") current = series.slice(-7);
  else if (key === "d30") current = series.slice(-30);
  else current = series.filter((d) => d.date >= range.from && d.date <= range.to);

  const startIndex = current.length ? series.findIndex((d) => d.date === current[0].date) : 0;
  const previous = current.length
    ? series.slice(Math.max(0, startIndex - current.length), startIndex)
    : [];
  return { current, previous };
}

type Slice = {
  label: string;
  fullDate: string;
  sales: number;
  orders: number;
  items: number;
  returns: number;
};

function splitHours(day: DayPoint, locale: Locale): Slice[] {
  const totalW = HOUR_WEIGHTS.reduce((a, b) => a + b, 0);
  let salesLeft = day.sales;
  let ordersLeft = day.orders;
  let itemsLeft = day.items;
  let returnsLeft = day.returnSum;
  return HOUR_WEIGHTS.map((weight, index) => {
    const hour = 8 + index;
    const last = index === HOUR_WEIGHTS.length - 1;
    const sales = last ? salesLeft : Math.round((day.sales * weight) / totalW);
    const orders = last ? ordersLeft : Math.round((day.orders * weight) / totalW);
    const items = last ? itemsLeft : Math.round((day.items * weight) / totalW);
    const returns = last ? returnsLeft : Math.round((day.returnSum * weight) / totalW);
    salesLeft -= sales;
    ordersLeft -= orders;
    itemsLeft -= items;
    returnsLeft -= returns;
    const hh = String(hour).padStart(2, "0");
    return {
      label: `${hh}:00`,
      fullDate: `${formatDayLong(day.date, locale)}, ${hh}:00`,
      sales,
      orders,
      items,
      returns,
    };
  });
}

export function buildChart(
  current: DayPoint[],
  previous: DayPoint[],
  key: PeriodKey,
  locale: Locale,
): ChartPoint[] {
  const hourly = key === "today" || key === "yesterday" || current.length === 1;
  const cur: Slice[] = hourly && current[0] ? splitHours(current[0], locale) : current.map((d) => ({
    label: formatDay(d.date, locale),
    fullDate: formatDayLong(d.date, locale),
    sales: d.sales,
    orders: d.orders,
    items: d.items,
    returns: d.returnSum,
  }));
  const prev: Slice[] = hourly && previous[0]
    ? splitHours(previous[0], locale)
    : previous.map((d) => ({
        label: formatDay(d.date, locale),
        fullDate: formatDayLong(d.date, locale),
        sales: d.sales,
        orders: d.orders,
        items: d.items,
        returns: d.returnSum,
      }));

  return cur.map((point, index) => {
    const before = prev[index];
    const avg = point.orders ? Math.round(point.sales / point.orders) : 0;
    const prevAvg = before?.orders ? Math.round(before.sales / before.orders) : 0;
    return {
      label: point.label,
      fullDate: point.fullDate,
      sales: point.sales,
      orders: point.orders,
      items: point.items,
      avg,
      returns: point.returns,
      prevSales: before?.sales ?? 0,
      prevOrders: before?.orders ?? 0,
      prevItems: before?.items ?? 0,
      prevAvg,
      prevReturns: before?.returns ?? 0,
    };
  });
}

export function funnelFrom(orders: number) {
  const purchases = Math.round(orders * 0.91);
  const cart = Math.max(orders, Math.round(orders / 0.39));
  const opens = Math.max(cart, Math.round(cart / 0.22));
  const impressions = Math.max(opens, Math.round(opens / 0.146));
  return [
    { key: "impressions" as const, value: impressions },
    { key: "opens" as const, value: opens },
    { key: "cart" as const, value: cart },
    { key: "orders" as const, value: orders },
    { key: "purchases" as const, value: purchases },
  ];
}

export function customersFrom(orders: number) {
  const total = Math.max(orders, Math.round(orders * 0.84));
  const fresh = Math.round(total * 0.63);
  return { total, fresh, returning: total - fresh };
}

export const REGIONS: { name: Record<Locale, string>; share: number }[] = [
  { name: { ru: "Ташкент", en: "Tashkent", uz: "Toshkent" }, share: 0.34 },
  { name: { ru: "Ташкентская область", en: "Tashkent region", uz: "Toshkent viloyati" }, share: 0.12 },
  { name: { ru: "Самарканд", en: "Samarkand", uz: "Samarqand" }, share: 0.09 },
  { name: { ru: "Фергана", en: "Fergana", uz: "Farg'ona" }, share: 0.08 },
  { name: { ru: "Андижан", en: "Andijan", uz: "Andijon" }, share: 0.07 },
  { name: { ru: "Наманган", en: "Namangan", uz: "Namangan" }, share: 0.06 },
  { name: { ru: "Бухара", en: "Bukhara", uz: "Buxoro" }, share: 0.06 },
  { name: { ru: "Кашкадарья", en: "Kashkadarya", uz: "Qashqadaryo" }, share: 0.05 },
  { name: { ru: "Хорезм", en: "Khorezm", uz: "Xorazm" }, share: 0.04 },
  { name: { ru: "Сурхандарья", en: "Surkhandarya", uz: "Surxondaryo" }, share: 0.03 },
  { name: { ru: "Навои", en: "Navoi", uz: "Navoiy" }, share: 0.025 },
  { name: { ru: "Джизак", en: "Jizzakh", uz: "Jizzax" }, share: 0.02 },
  { name: { ru: "Сырдарья", en: "Syrdarya", uz: "Sirdaryo" }, share: 0.015 },
  { name: { ru: "Каракалпакстан", en: "Karakalpakstan", uz: "Qoraqalpog'iston" }, share: 0.01 },
];

export function formatClockLabel(iso: string) {
  return formatClock(iso);
}
