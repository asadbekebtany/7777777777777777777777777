"use client";

import { PeriodPicker } from "@/components/period-picker";
import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState, Pagination } from "@/components/ui/feedback";
import { Search } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { fill } from "@/lib/i18n";
import { dayKey, formatDateTime, formatMoney } from "@/lib/format";
import { selectPeriod, TODAY } from "@/lib/metrics";
import type { PeriodKey, ReturnRequest, ReturnStatus } from "@/lib/types";
import { RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const TABS: Array<ReturnStatus | "all"> = ["all", "new", "review", "approved", "rejected", "completed"];

export function ReturnsView() {
  const { t, locale, returns, series } = useSeller();
  const params = useSearchParams();
  const statusParam = params.get("status");
  const idParam = params.get("id");
  const [tab, setTab] = useState<ReturnStatus | "all">(isStatus(statusParam) ? statusParam : "all");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<PeriodKey>("d30");
  const [range, setRange] = useState({ from: series[0]?.date ?? TODAY, to: TODAY });
  const [openId, setOpenId] = useState<string | null>(idParam);
  const [page, setPage] = useState(1);
  const labels = returnLabels(t);
  const [paramKey, setParamKey] = useState(`${statusParam}|${idParam}`);
  const nextKey = `${statusParam}|${idParam}`;
  if (paramKey !== nextKey) {
    setParamKey(nextKey);
    if (isStatus(statusParam)) setTab(statusParam);
    if (idParam) setOpenId(idParam);
  }

  const filtered = useMemo(() => {
    const allowed = new Set(selectPeriod(series, period, range).current.map((day) => day.date));
    return returns.filter((item) => {
    if (tab !== "all" && item.status !== tab) return false;
    if (!allowed.has(dayKey(item.createdAt))) return false;
    const blob = `${item.id} ${item.orderId} ${item.product} ${item.buyer}`.toLowerCase();
    return !query || blob.includes(query.toLowerCase());
  });
  }, [returns, tab, query, series, period, range]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * 8, safePage * 8);
  const opened = returns.find((item) => item.id === openId);

  return (
    <Screen title={t.returns.title} subtitle={t.returns.subtitle} actions={<PeriodPicker value={period} onChange={(value) => { setPeriod(value); setPage(1); }} range={range} onRange={setRange} min={series[0]?.date} max={TODAY} />}>
      <Tabs value={tab} onChange={(id) => { setTab(id as ReturnStatus | "all"); setPage(1); }} tabs={TABS.map((id) => ({ id, label: id === "all" ? t.common.all : labels[id], count: id === "all" ? returns.length : returns.filter((item) => item.status === id).length }))} />
      <Search value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder={t.returns.search} className="max-w-md" />
      {rows.length === 0 ? (
        <EmptyState icon={<RotateCcw className="size-5" />} title={returns.length ? t.returns.emptyFilter : t.returns.empty} text={returns.length ? t.returns.emptyFilterText : t.returns.emptyText} />
      ) : (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>{t.returns.colNumber}</Th>
                  <Th>{t.returns.colOrder}</Th>
                  <Th>{t.returns.colProduct}</Th>
                  <Th className="hidden lg:table-cell">{t.returns.colBuyer}</Th>
                  <Th>{t.returns.colSum}</Th>
                  <Th className="hidden md:table-cell">{t.returns.colReason}</Th>
                  <Th className="hidden xl:table-cell">{t.returns.colDate}</Th>
                  <Th>{t.returns.colStatus}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="cursor-pointer hover:bg-tawfiq-50/50" onClick={() => setOpenId(item.id)}>
                    <Td className="font-medium">{item.id}</Td>
                    <Td>{item.orderId}</Td>
                    <Td>{item.product}</Td>
                    <Td className="hidden lg:table-cell">{item.buyer}</Td>
                    <Td className="whitespace-nowrap tabular-nums">{formatMoney(item.amount, locale)}</Td>
                    <Td className="hidden md:table-cell">{item.reason}</Td>
                    <Td className="hidden xl:table-cell whitespace-nowrap text-muted">{formatDateTime(item.createdAt, locale)}</Td>
                    <Td><StatusBadge status={item.status} label={labels[item.status]} /></Td>
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
        {opened && <ReturnBody item={opened} />}
      </Drawer>
    </Screen>
  );
}

function ReturnBody({ item }: { item: ReturnRequest }) {
  const { t, locale } = useSeller();
  return (
    <div className="space-y-3 text-sm">
      <p><span className="text-muted">{t.returns.colOrder}: </span>{item.orderId}</p>
      <p><span className="text-muted">{t.returns.colProduct}: </span>{item.product}</p>
      <p><span className="text-muted">{t.returns.colBuyer}: </span>{item.buyer}</p>
      <p><span className="text-muted">{t.returns.colSum}: </span>{formatMoney(item.amount, locale)}</p>
      <p><span className="text-muted">{t.returns.colReason}: </span>{item.reason}</p>
      <p><span className="text-muted">{t.returns.colDate}: </span>{formatDateTime(item.createdAt, locale)}</p>
      <div className="rounded-xl bg-canvas p-3">
        <p className="text-xs text-muted">{t.returns.comment}</p>
        <p className="mt-1 leading-relaxed">{item.comment}</p>
      </div>
    </div>
  );
}

function isStatus(value: string | null): value is ReturnStatus {
  return value === "new" || value === "review" || value === "approved" || value === "rejected" || value === "completed";
}
function returnLabels(t: ReturnType<typeof useSeller>["t"]) {
  return { new: t.status.new, review: t.status.review, approved: t.status.approved, rejected: t.status.rejected, completed: t.status.completed };
}
