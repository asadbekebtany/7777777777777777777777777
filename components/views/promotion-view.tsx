"use client";

import { SalesChart } from "@/components/sales-chart";
import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { Table, TableWrap, Td, Th } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { buildChart, selectPeriod, sumDays } from "@/lib/metrics";
import { Megaphone } from "lucide-react";
import { useState } from "react";

export function PromotionView() {
  const { t, locale, campaigns, promos, codes, toggleCode, addPromo, series, toast } = useSeller();
  const [tab, setTab] = useState("overview");
  const [open, setOpen] = useState(false);
  const spend = campaigns.reduce((sum, item) => sum + item.spend, 0);
  const sales = campaigns.reduce((sum, item) => sum + item.sales, 0);
  const orders = campaigns.reduce((sum, item) => sum + item.orders, 0);
  const efficiency = spend ? sales / spend : 0;
  const month = selectPeriod(series, "d30", { from: "", to: "" });
  const points = buildChart(month.current, month.previous, "d30", locale);

  return (
    <Screen title={t.promotion.title} subtitle={t.promotion.subtitle} actions={<Button onClick={() => setOpen(true)}>{t.promotion.create}</Button>}>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label={t.promotion.spend} value={formatMoney(spend, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
        <StatCard label={t.promotion.sales} value={formatMoney(sales, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
        <StatCard label={t.promotion.orders} value={formatNumber(orders, locale)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
        <StatCard label={t.promotion.efficiency} value={`${efficiency.toFixed(1)}×`} hint={t.promotion.roas} delta={null} deltaLabel="—" />
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: t.promotion.overview },
          { id: "ads", label: t.promotion.ads },
          { id: "promos", label: t.promotion.promos },
          { id: "codes", label: t.promotion.codes },
          { id: "results", label: t.promotion.results },
        ]}
      />
      {tab === "overview" && (
        <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
          <h2 className="mb-3 font-semibold">{t.home.chart}</h2>
          <SalesChart points={points} metric="sales" locale={locale} labels={{ sales: t.home.sales, orders: t.home.orders, avg: t.home.avg, current: t.home.current, previous: t.home.previous }} />
          <p className="mt-2 text-xs text-muted">{formatMoney(sumDays(month.current).sales, locale)} · {t.period.d30}</p>
        </div>
      )}
      {tab === "ads" && (
        <CampaignTable />
      )}
      {tab === "promos" && (
        <div className="grid gap-3 md:grid-cols-2">
          {promos.map((promo) => (
            <article key={promo.id} className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{promo.name}</h3>
                  <p className="mt-1 text-sm text-muted">{promo.period}</p>
                </div>
                <StatusBadge status={promo.status} label={statusText(promo.status, t)} />
              </div>
              <p className="mt-3 text-lg font-semibold text-tawfiq-800">{promo.discount}</p>
            </article>
          ))}
        </div>
      )}
      {tab === "codes" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {codes.map((code) => (
            <article key={code.id} className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-semibold tracking-wide">{code.code}</p>
                <StatusBadge status={code.status} label={code.status === "active" ? t.status.active : t.status.paused} />
              </div>
              <p className="mt-2 text-sm text-muted">{code.discount} · {t.promotion.uses} {code.uses}/{code.limit}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(code.code); toast(t.toast.copied); }}>{t.promotion.copy}</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleCode(code.id)}>{code.status === "active" ? t.promotion.pause : t.promotion.resume}</Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {tab === "results" && (
        campaigns.length === 0 ? <EmptyState icon={<Megaphone className="size-5" />} title={t.promotion.empty} /> : (
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>{t.promotion.name}</Th>
                    <Th>{t.promotion.spend}</Th>
                    <Th>{t.promotion.sales}</Th>
                    <Th>{t.promotion.orders}</Th>
                    <Th>{t.promotion.efficiency}</Th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((item) => (
                    <tr key={item.id}>
                      <Td>{item.name}</Td>
                      <Td className="tabular-nums">{formatMoney(item.spend, locale)}</Td>
                      <Td className="tabular-nums">{formatMoney(item.sales, locale)}</Td>
                      <Td className="tabular-nums">{item.orders}</Td>
                      <Td className="tabular-nums">{formatPercent(item.spend ? ((item.sales - item.spend) / item.spend) * 100 : null, locale)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </div>
        )
      )}
      <PromoForm open={open} onClose={() => setOpen(false)} onSave={addPromo} />
    </Screen>
  );
}

function CampaignTable() {
  const { t, locale, campaigns, toggleCampaign } = useSeller();
  if (!campaigns.length) return <EmptyState icon={<Megaphone className="size-5" />} title={t.promotion.empty} />;
  return (
    <div className="rounded-2xl border border-line bg-white shadow-card">
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>{t.promotion.name}</Th>
              <Th>{t.promotion.ads}</Th>
              <Th>{t.promotion.spend}</Th>
              <Th>{t.promotion.sales}</Th>
              <Th>{t.common.status}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((item) => (
              <tr key={item.id} className="hover:bg-tawfiq-50/40">
                <Td className="font-medium">{item.name}</Td>
                <Td>{item.placement === "search" ? t.promotion.search : t.promotion.showcase}</Td>
                <Td className="tabular-nums">{formatMoney(item.spend, locale)}</Td>
                <Td className="tabular-nums">{formatMoney(item.sales, locale)}</Td>
                <Td><StatusBadge status={item.status} label={item.status === "active" ? t.status.active : t.status.paused} /></Td>
                <Td><Button size="sm" variant="secondary" onClick={() => toggleCampaign(item.id)}>{item.status === "active" ? t.promotion.pause : t.promotion.resume}</Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}

function PromoForm({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (promo: { name: string; discount: string; period: string }) => void }) {
  const { t } = useSeller();
  const [name, setName] = useState("");
  const [discount, setDiscount] = useState("10%");
  const [period, setPeriod] = useState("1–31 окт 2026");
  return (
    <Modal open={open} onClose={onClose} title={t.promotion.formTitle} description={t.promotion.formText}>
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (!name) return; onSave({ name, discount, period }); onClose(); }}>
        <Field label={t.promotion.name}><Input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <Field label={t.promotion.discount}><Input value={discount} onChange={(event) => setDiscount(event.target.value)} /></Field>
        <Field label={t.promotion.period}><Input value={period} onChange={(event) => setPeriod(event.target.value)} /></Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>{t.common.cancel}</Button>
          <Button type="submit">{t.promotion.save}</Button>
        </div>
      </form>
    </Modal>
  );
}

function statusText(status: string, t: ReturnType<typeof useSeller>["t"]) {
  if (status === "active") return t.status.active;
  if (status === "scheduled") return t.status.scheduled;
  if (status === "draft") return t.status.draft;
  if (status === "ended") return t.status.ended;
  return status;
}
