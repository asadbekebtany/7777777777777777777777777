"use client";

import { PeriodPicker } from "@/components/period-picker";
import { ProductThumb } from "@/components/product-thumb";
import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, Pagination } from "@/components/ui/feedback";
import { Search, Select } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { fill } from "@/lib/i18n";
import { dayKey, formatDateTime, formatMoney, NOW_ISO } from "@/lib/format";
import { selectPeriod, TODAY } from "@/lib/metrics";
import type { Order, OrderStatus, PeriodKey, Scheme } from "@/lib/types";
import { ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const STATUSES: Array<OrderStatus | "all"> = ["all", "new", "assembling", "shipping", "completed", "cancelled"];

export function OrdersView() {
  const { t, locale, orders, series, advanceOrder } = useSeller();
  const params = useSearchParams();
  const statusParam = params.get("status");
  const orderParam = params.get("order");
  const [tab, setTab] = useState<OrderStatus | "all">(isStatus(statusParam) ? statusParam : "all");
  const [query, setQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [scheme, setScheme] = useState<Scheme | "all">("all");
  const [period, setPeriod] = useState<PeriodKey>("d30");
  const [range, setRange] = useState({ from: series[0]?.date ?? TODAY, to: TODAY });
  const [openId, setOpenId] = useState<string | null>(orderParam);
  const [page, setPage] = useState(1);
  const [paramKey, setParamKey] = useState(`${statusParam}|${orderParam}`);
  const nextKey = `${statusParam}|${orderParam}`;
  if (paramKey !== nextKey) {
    setParamKey(nextKey);
    if (isStatus(statusParam)) setTab(statusParam);
    if (orderParam) setOpenId(orderParam);
  }

  const filtered = useMemo(() => {
    const allowed = new Set(selectPeriod(series, period, range).current.map((day) => day.date));
    return orders.filter((order) => {
      if (tab !== "all" && order.status !== tab) return false;
      if (scheme !== "all" && order.scheme !== scheme) return false;
      if (period === "custom" && range.from > range.to) return false;
      if (!allowed.has(dayKey(order.createdAt))) return false;
      if (query && !order.id.toLowerCase().includes(query.toLowerCase())) return false;
      if (productQuery && !order.items.some((item) => item.name.toLowerCase().includes(productQuery.toLowerCase()))) return false;
      return true;
    });
  }, [orders, tab, scheme, query, productQuery, series, period, range]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * 8, safePage * 8);
  const opened = orders.find((order) => order.id === openId) ?? null;
  const labels = statusLabels(t);

  return (
    <Screen
      title={t.orders.title}
      subtitle={t.orders.subtitle}
      actions={<PeriodPicker value={period} onChange={(value) => { setPeriod(value); setPage(1); }} range={range} onRange={(next) => { setRange(next); setPage(1); }} min={series[0]?.date} max={TODAY} />}
    >
      <Tabs
        value={tab}
        onChange={(id) => { setTab(id as OrderStatus | "all"); setPage(1); }}
        tabs={STATUSES.map((id) => ({
          id,
          label: id === "all" ? t.common.all : labels[id],
          count: id === "all" ? orders.length : orders.filter((order) => order.status === id).length,
        }))}
      />
      <div className="grid gap-2 md:grid-cols-3">
        <Search value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder={t.orders.searchOrder} />
        <Search value={productQuery} onChange={(value) => { setProductQuery(value); setPage(1); }} placeholder={t.orders.searchProduct} />
        <Select
          ariaLabel={t.orders.scheme}
          value={scheme}
          onChange={(value) => { setScheme(value as Scheme | "all"); setPage(1); }}
          options={[
            { value: "all", label: t.scheme.all },
            { value: "FBS", label: t.scheme.fbs },
            { value: "DBS", label: t.scheme.dbs },
          ]}
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={<ShoppingBag className="size-5" />} title={orders.length ? t.orders.emptyFilter : t.orders.empty} text={orders.length ? t.orders.emptyFilterText : t.orders.emptyText} />
      ) : (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>{t.orders.colNumber}</Th>
                  <Th>{t.orders.colDate}</Th>
                  <Th>{t.orders.colProduct}</Th>
                  <Th className="hidden md:table-cell">{t.orders.colQty}</Th>
                  <Th className="hidden lg:table-cell">{t.orders.colBuyer}</Th>
                  <Th>{t.orders.colSum}</Th>
                  <Th className="hidden md:table-cell">{t.orders.colScheme}</Th>
                  <Th className="hidden xl:table-cell">{t.orders.colDeadline}</Th>
                  <Th>{t.orders.colStatus}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id} className="cursor-pointer hover:bg-tawfiq-50/50" onClick={() => setOpenId(order.id)}>
                    <Td className="font-medium">{order.id}</Td>
                    <Td className="whitespace-nowrap text-muted">{formatDateTime(order.createdAt, locale)}</Td>
                    <Td>
                      <span className="line-clamp-2">{order.items[0]?.name}</span>
                      {order.items.length > 1 && <span className="text-xs text-muted">{fill(t.orders.more, { count: order.items.length - 1 })}</span>}
                    </Td>
                    <Td className="hidden md:table-cell tabular-nums">{qty(order)}</Td>
                    <Td className="hidden lg:table-cell">{order.buyer}</Td>
                    <Td className="whitespace-nowrap tabular-nums">{formatMoney(total(order), locale)}</Td>
                    <Td className="hidden md:table-cell">{order.scheme}</Td>
                    <Td className="hidden xl:table-cell">
                      <span className={overdue(order) ? "text-danger" : ""}>{overdue(order) ? t.orders.overdue : formatDateTime(order.deadline, locale)}</span>
                    </Td>
                    <Td><StatusBadge status={order.status} label={labels[order.status]} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
          <div className="px-3 pb-3">
            <Pagination page={safePage} pageCount={pageCount} onPage={setPage} label={fill(t.common.range, { from: (safePage - 1) * 8 + 1, to: Math.min(safePage * 8, filtered.length), total: filtered.length })} />
          </div>
        </div>
      )}
      <Drawer open={Boolean(opened)} onClose={() => setOpenId(null)} title={opened?.id ?? ""} description={opened ? labels[opened.status] : undefined}>
        {opened && <OrderBody order={opened} onAdvance={() => advanceOrder(opened.id)} />}
      </Drawer>
    </Screen>
  );
}

function OrderBody({ order, onAdvance }: { order: Order; onAdvance: () => void }) {
  const { t, locale } = useSeller();
  const labels = statusLabels(t);
  const next = order.status === "new" ? t.orders.assemble : order.status === "assembling" ? t.orders.ship : order.status === "shipping" ? t.orders.complete : "";
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={order.status} label={labels[order.status]} />
        {next ? <Button onClick={onAdvance}>{next}</Button> : <span className="text-sm text-muted">{t.orders.done}</span>}
      </div>
      <section>
        <h3 className="text-sm font-medium">{t.orders.items}</h3>
        <ul className="mt-2 space-y-2">
          {order.items.map((item) => (
            <li key={item.sku} className="flex items-center gap-3 rounded-xl border border-line p-2">
              <ProductThumb kind={item.kind} alt={item.name} className="size-12" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm">{item.name}</span>
                <span className="text-xs text-muted">{item.sku} · {item.qty} {t.common.pieces}</span>
              </span>
              <span className="text-sm tabular-nums">{formatMoney(item.price * item.qty, locale)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-right text-sm font-medium tabular-nums">{formatMoney(total(order), locale)}</p>
      </section>
      <Info title={t.orders.buyer} lines={[order.buyer, order.phone, order.city]} />
      <Info title={t.orders.delivery} lines={[order.scheme, order.address, `${t.orders.deadline}: ${formatDateTime(order.deadline, locale)}`]} />
      <Info title={t.orders.payment} lines={[order.payment]} />
      <section>
        <h3 className="text-sm font-medium">{t.orders.timeline}</h3>
        <ol className="mt-3 space-y-3 border-l border-tawfiq-200 pl-4">
          {order.history.map((step) => (
            <li key={`${step.status}-${step.at}`} className="relative">
              <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-tawfiq-700" />
              <p className="text-sm">{labels[step.status]}</p>
              <p className="text-xs text-muted">{formatDateTime(step.at, locale)}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Info({ title, lines }: { title: string; lines: string[] }) {
  return (
    <section className="rounded-xl bg-canvas px-3 py-3">
      <h3 className="text-xs text-muted">{title}</h3>
      {lines.map((line) => <p key={line} className="mt-1 text-sm">{line}</p>)}
    </section>
  );
}

function total(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
function qty(order: Order) {
  return order.items.reduce((sum, item) => sum + item.qty, 0);
}
function overdue(order: Order) {
  return order.status !== "completed" && order.status !== "cancelled" && new Date(order.deadline).getTime() < new Date(NOW_ISO).getTime();
}
function isStatus(value: string | null): value is OrderStatus {
  return value === "new" || value === "assembling" || value === "shipping" || value === "completed" || value === "cancelled";
}
function statusLabels(t: ReturnType<typeof useSeller>["t"]) {
  return {
    new: t.status.new,
    assembling: t.status.assembling,
    shipping: t.status.shipping,
    completed: t.status.completed,
    cancelled: t.status.cancelled,
  };
}
