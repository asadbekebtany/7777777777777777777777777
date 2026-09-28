"use client";

import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { EmptyState, Pagination } from "@/components/ui/feedback";
import { DateRangePicker } from "@/components/ui/field";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { fill } from "@/lib/i18n";
import { formatDayLong, formatMoney } from "@/lib/format";
import { sumDays, TODAY } from "@/lib/metrics";
import { downloadFinanceReport } from "@/lib/report";
import { Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const TABS = ["balance", "payouts", "operations", "commissions", "services", "returns", "reports"] as const;

export function FinanceView() {
  const { t, locale, series, wallet, payouts, store, toast } = useSeller();
  const params = useSearchParams();
  const initial = params.get("tab");
  const [tab, setTab] = useState<(typeof TABS)[number]>(isTab(initial) ? initial : "balance");
  const [tabKey, setTabKey] = useState(initial);
  if (tabKey !== initial) {
    setTabKey(initial);
    if (isTab(initial)) setTab(initial);
  }
  const [range, setRange] = useState({ from: "2026-09-01", to: TODAY });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const invalid = range.from > range.to;
  const days = invalid ? [] : series.filter((day) => day.date >= range.from && day.date <= range.to);
  const totals = sumDays(days);
  const shown = totals;

  async function download(from = range.from, to = range.to) {
    if (from > to) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const slice = series.filter((day) => day.date >= from && day.date <= to);
    downloadFinanceReport(slice, locale, store.name.toLowerCase().replaceAll(" ", "-"), from, to);
    setLoading(false);
    toast(t.toast.report);
  }

  const rows = days.flatMap((day) => {
    const part = sumDays([day]);
    return [
      [day.date, t.ops.sale, `SAL-${day.date}`, t.ops.saleDesc, part.sales],
      [day.date, t.ops.commission, `COM-${day.date}`, t.ops.commissionDesc, -part.commission],
      [day.date, t.ops.logistics, `LOG-${day.date}`, t.ops.logisticsDesc, -part.logistics],
      [day.date, t.ops.placement, `PLC-${day.date}`, t.ops.placementDesc, -part.placement],
      ...(part.returnSum ? [[day.date, t.ops.return, `RET-${day.date}`, t.ops.returnDesc, -part.returnSum] as const] : []),
    ];
  });
  const pageCount = Math.max(1, Math.ceil(rows.length / 8));
  const safePage = Math.min(page, pageCount);
  const visible = rows.slice((safePage - 1) * 8, safePage * 8);

  return (
    <Screen
      title={t.finance.title}
      subtitle={t.finance.subtitle}
      actions={<Button onClick={() => download()} disabled={loading || invalid}>{loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}{t.finance.download}</Button>}
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label={t.finance.balance} value={formatMoney(wallet.available + wallet.pending, locale)} hint={t.common.account} delta={null} deltaLabel="—" />
        <StatCard label={t.finance.available} value={formatMoney(wallet.available, locale)} hint={t.common.account} delta={null} deltaLabel="—" />
        <StatCard label={t.finance.pending} value={formatMoney(wallet.pending, locale)} hint={t.common.account} delta={null} deltaLabel="—" />
        <StatCard label={t.finance.sales} value={formatMoney(shown.sales, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
        <StatCard label={t.finance.returns} value={formatMoney(shown.returnSum, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" invert />
        <StatCard label={t.finance.fees} value={formatMoney(shown.fees, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
      </div>
      <Tabs value={tab} onChange={(id) => setTab(id as (typeof TABS)[number])} tabs={TABS.map((id) => ({ id, label: t.finance.tabs[id] }))} />
      {tab === "balance" && (
        <Card>
          <ul className="space-y-2 text-sm">
            <Line label={t.finance.formulaSales} value={formatMoney(totals.sales, locale)} />
            <Line label={t.finance.formulaReturns} value={`− ${formatMoney(totals.returnSum, locale)}`} />
            <Line label={t.finance.formulaCommission} value={`− ${formatMoney(totals.commission, locale)}`} />
            <Line label={t.finance.formulaServices} value={`− ${formatMoney(totals.services, locale)}`} />
            <li className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <span>{t.finance.formulaNet}</span>
              <span className="tabular-nums">{formatMoney(totals.payout, locale)}</span>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.finance.note}</p>
        </Card>
      )}
      {tab === "payouts" && (
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <TableWrap>
            <Table>
              <thead><tr><Th>{t.finance.colDate}</Th><Th>{t.finance.colAmount}</Th><Th>{t.finance.payoutAccount}</Th><Th>{t.common.status}</Th></tr></thead>
              <tbody>
                {payouts.map((item) => (
                  <tr key={item.id}>
                    <Td>{formatDayLong(item.date, locale)}</Td>
                    <Td className="tabular-nums">{formatMoney(item.amount, locale)}</Td>
                    <Td>{item.account}</Td>
                    <Td><StatusBadge status={item.status} label={item.status === "paid" ? t.status.paid : t.status.pending} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </div>
      )}
      {tab === "operations" && (
        rows.length === 0 ? <EmptyState title={invalid ? t.finance.reportError : t.finance.opsEmpty} /> : (
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <TableWrap>
              <Table>
                <thead><tr><Th>{t.finance.colDate}</Th><Th>{t.finance.colType}</Th><Th>{t.finance.colDoc}</Th><Th className="hidden md:table-cell">{t.finance.colDesc}</Th><Th>{t.finance.colAmount}</Th></tr></thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={String(row[2])}>
                      <Td>{String(row[0])}</Td>
                      <Td>{String(row[1])}</Td>
                      <Td>{String(row[2])}</Td>
                      <Td className="hidden md:table-cell">{String(row[3])}</Td>
                      <Td className="tabular-nums">{formatMoney(Number(row[4]), locale)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
            <div className="px-3 pb-3">
              <Pagination page={safePage} pageCount={pageCount} onPage={setPage} label={fill(t.common.range, { from: (safePage - 1) * 8 + 1, to: Math.min(safePage * 8, rows.length), total: rows.length })} />
            </div>
          </div>
        )
      )}
      {tab === "commissions" && (
        <Card>
          <p className="text-sm text-muted">{t.finance.rate}</p>
          <p className="mt-4 text-2xl font-semibold tabular-nums">{formatMoney(totals.commission, locale)}</p>
          <p className="mt-1 text-sm text-muted">{t.finance.formulaCommission}</p>
        </Card>
      )}
      {tab === "services" && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="font-medium">{t.finance.logistics}</h2>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{formatMoney(totals.logistics, locale)}</p>
          </Card>
          <Card>
            <h2 className="font-medium">{t.finance.placement}</h2>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{formatMoney(totals.placement, locale)}</p>
          </Card>
          <p className="text-sm text-muted md:col-span-2">{t.finance.servicesNote} <Link className="text-tawfiq-700" href="/promotion">{t.finance.adLink}</Link></p>
        </div>
      )}
      {tab === "returns" && (
        <Card>
          <p className="text-2xl font-semibold tabular-nums">{formatMoney(totals.returnSum, locale)}</p>
          <p className="mt-1 text-sm text-muted">{t.finance.formulaReturns}</p>
          <Link href="/returns" className="mt-4 inline-block text-sm text-tawfiq-700">{t.nav.returns}</Link>
        </Card>
      )}
      {tab === "reports" && (
        <Card>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">{t.finance.reportHint}</p>
          <div className="mt-4 max-w-md">
            <DateRangePicker fromLabel={t.period.from} toLabel={t.period.to} from={range.from} to={range.to} min={series[0]?.date} max={TODAY} onChange={(next) => { setRange(next); setPage(1); }} />
          </div>
          {invalid && <p className="mt-2 text-sm text-danger">{t.finance.reportError}</p>}
          <Button className="mt-4" disabled={loading || invalid} onClick={() => download()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {t.finance.download}
          </Button>
          <h3 className="mt-6 text-sm font-medium">{t.finance.reportRecent}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => download("2026-08-01", "2026-08-31")}>01.08.2026 — 31.08.2026</Button>
            <Button variant="secondary" size="sm" onClick={() => download("2026-07-31", "2026-07-31")}>31.07.2026</Button>
          </div>
        </Card>
      )}
    </Screen>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <li className="flex justify-between gap-4"><span className="text-muted">{label}</span><span className="tabular-nums">{value}</span></li>;
}

function isTab(value: string | null): value is (typeof TABS)[number] {
  return TABS.includes(value as (typeof TABS)[number]);
}
