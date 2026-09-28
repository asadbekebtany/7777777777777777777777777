"use client";

import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import type { Locale, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const SECTIONS = ["store", "seller", "delivery", "fbs", "dbs", "payouts", "notifications", "integrations", "security", "language", "ai"] as const;

export function SettingsView() {
  const { t, settings, updateSettings, locale, setLocale, toast, storeId } = useSeller();
  const params = useSearchParams();
  const initial = params.get("section");
  const [section, setSection] = useState<(typeof SECTIONS)[number]>(isSection(initial) ? initial : "store");
  const [draft, setDraft] = useState(settings);
  const [modal, setModal] = useState(false);
  const [password, setPassword] = useState("");
  const [sectionKey, setSectionKey] = useState(initial);
  const [storeKey, setStoreKey] = useState(storeId);
  if (sectionKey !== initial) {
    setSectionKey(initial);
    if (isSection(initial)) setSection(initial);
  }
  if (storeKey !== storeId) {
    setStoreKey(storeId);
    setDraft(settings);
  }

  function patch(partial: Partial<Settings>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  return (
    <Screen title={t.settings.title} subtitle={t.settings.subtitle}>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {SECTIONS.map((id) => (
            <button key={id} type="button" onClick={() => setSection(id)} className={cn("shrink-0 rounded-xl px-3 py-2 text-left text-sm", section === id ? "bg-tawfiq-800 text-white" : "text-ink-soft hover:bg-white")}>
              {t.settings.nav[id]}
            </button>
          ))}
        </nav>
        <Card>
          {section === "store" && (
            <Form onSave={() => updateSettings({ storeName: draft.storeName, description: draft.description, address: draft.address, phone: draft.phone })}>
              <Field label={t.settings.storeName}><Input value={draft.storeName} onChange={(event) => patch({ storeName: event.target.value })} /></Field>
              <Field label={t.settings.description}><Textarea value={draft.description} onChange={(event) => patch({ description: event.target.value })} /></Field>
              <Field label={t.settings.address}><Input value={draft.address} onChange={(event) => patch({ address: event.target.value })} /></Field>
              <Field label={t.settings.phone}><Input value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} /></Field>
            </Form>
          )}
          {section === "seller" && (
            <Form onSave={() => updateSettings({ sellerName: draft.sellerName, sellerPhone: draft.sellerPhone, inn: draft.inn, email: draft.email })}>
              <Field label={t.settings.sellerName}><Input value={draft.sellerName} onChange={(event) => patch({ sellerName: event.target.value })} /></Field>
              <Field label={t.settings.phone}><Input value={draft.sellerPhone} onChange={(event) => patch({ sellerPhone: event.target.value })} /></Field>
              <Field label={t.settings.inn}><Input value={draft.inn} onChange={(event) => patch({ inn: event.target.value })} /></Field>
              <Field label={t.settings.email}><Input value={draft.email} onChange={(event) => patch({ email: event.target.value })} /></Field>
            </Form>
          )}
          {section === "delivery" && <p className="text-sm leading-relaxed text-muted">{t.settings.deliveryHint}</p>}
          {section === "fbs" && (
            <Form onSave={() => updateSettings({ fbsWarehouse: draft.fbsWarehouse, fbsCutoff: draft.fbsCutoff, fbsSla: draft.fbsSla })}>
              <Field label={t.settings.warehouse}><Input value={draft.fbsWarehouse} onChange={(event) => patch({ fbsWarehouse: event.target.value })} /></Field>
              <Field label={t.settings.cutoff}><Input value={draft.fbsCutoff} onChange={(event) => patch({ fbsCutoff: event.target.value })} /></Field>
              <Field label={t.settings.sla}><Input value={draft.fbsSla} onChange={(event) => patch({ fbsSla: event.target.value })} /></Field>
            </Form>
          )}
          {section === "dbs" && (
            <Form onSave={() => updateSettings({ dbsZones: draft.dbsZones, dbsCourier: draft.dbsCourier, dbsSla: draft.dbsSla })}>
              <Field label={t.settings.zones}><Input value={draft.dbsZones} onChange={(event) => patch({ dbsZones: event.target.value })} /></Field>
              <Field label={t.settings.courier}><Input value={draft.dbsCourier} onChange={(event) => patch({ dbsCourier: event.target.value })} /></Field>
              <Field label={t.settings.sla}><Input value={draft.dbsSla} onChange={(event) => patch({ dbsSla: event.target.value })} /></Field>
            </Form>
          )}
          {section === "payouts" && (
            <Form onSave={() => updateSettings({ payoutAccount: draft.payoutAccount, payoutBank: draft.payoutBank, payoutSchedule: draft.payoutSchedule })}>
              <Field label={t.settings.account}><Input value={draft.payoutAccount} onChange={(event) => patch({ payoutAccount: event.target.value })} /></Field>
              <Field label={t.settings.bank}><Input value={draft.payoutBank} onChange={(event) => patch({ payoutBank: event.target.value })} /></Field>
              <Field label={t.settings.schedule}><Input value={draft.payoutSchedule} onChange={(event) => patch({ payoutSchedule: event.target.value })} /></Field>
            </Form>
          )}
          {section === "notifications" && (
            <div className="space-y-3">
              <ToggleRow label={t.settings.notifyOrders} checked={draft.notifyOrders} onChange={(notifyOrders) => { patch({ notifyOrders }); updateSettings({ notifyOrders }); }} />
              <ToggleRow label={t.settings.notifyReturns} checked={draft.notifyReturns} onChange={(notifyReturns) => { patch({ notifyReturns }); updateSettings({ notifyReturns }); }} />
              <ToggleRow label={t.settings.notifyReviews} checked={draft.notifyReviews} onChange={(notifyReviews) => { patch({ notifyReviews }); updateSettings({ notifyReviews }); }} />
              <ToggleRow label={t.settings.notifyPayouts} checked={draft.notifyPayouts} onChange={(notifyPayouts) => { patch({ notifyPayouts }); updateSettings({ notifyPayouts }); }} />
              <ToggleRow label={t.settings.notifyAi} checked={draft.notifyAi} onChange={(notifyAi) => { patch({ notifyAi }); updateSettings({ notifyAi }); }} />
            </div>
          )}
          {section === "integrations" && (
            <div>
              <p className="text-xs tracking-wide text-brass">{t.settings.soon}</p>
              <h2 className="mt-1 text-lg font-semibold">{t.settings.integrationsTitle}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t.settings.integrationsBody}</p>
              <Button className="mt-4" variant="secondary" onClick={() => setModal(true)}>{t.settings.connect}</Button>
            </div>
          )}
          {section === "security" && (
            <form className="max-w-md space-y-4" onSubmit={(event) => { event.preventDefault(); setPassword(""); toast(t.toast.password); }}>
              <Field label={t.settings.password}><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
              <ToggleRow label={t.settings.twoFactor} checked={draft.twoFactor} onChange={(twoFactor) => { patch({ twoFactor }); updateSettings({ twoFactor }); }} />
              <Button type="submit">{t.settings.passwordSave}</Button>
            </form>
          )}
          {section === "language" && (
            <div>
              <h2 className="font-medium">{t.settings.languageTitle}</h2>
              <p className="mt-1 text-sm text-muted">{t.settings.languageHint}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["ru", "uz", "en"] as Locale[]).map((item) => (
                  <Button key={item} variant={locale === item ? "primary" : "secondary"} onClick={() => setLocale(item)}>
                    {item === "ru" ? "Русский" : item === "uz" ? "O‘zbekcha" : "English"}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {section === "ai" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t.settings.tone}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["friendly", "neutral", "formal"] as const).map((tone) => (
                    <Button key={tone} variant={draft.aiTone === tone ? "primary" : "secondary"} onClick={() => { patch({ aiTone: tone }); updateSettings({ aiTone: tone }); }}>{t.settings.tones[tone]}</Button>
                  ))}
                </div>
              </div>
              <ToggleRow label={t.settings.auto} checked={draft.aiAutoReply} onChange={(aiAutoReply) => { patch({ aiAutoReply }); updateSettings({ aiAutoReply }); }} />
              <p className="text-sm leading-relaxed text-muted">{t.settings.autoHint}</p>
            </div>
          )}
        </Card>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={t.settings.modalTitle} description={t.settings.modalBody}>
        <div className="flex justify-end"><Button onClick={() => setModal(false)}>{t.common.close}</Button></div>
      </Modal>
    </Screen>
  );
}

function Form({ children, onSave }: { children: React.ReactNode; onSave: () => void }) {
  const { t } = useSeller();
  return (
    <form className="max-w-xl space-y-3" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      {children}
      <Button type="submit">{t.settings.save}</Button>
    </form>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-3 py-3">
      <span className="text-sm">{label}</span>
      <Toggle checked={checked} label={label} onChange={onChange} />
    </div>
  );
}

function isSection(value: string | null): value is (typeof SECTIONS)[number] {
  return SECTIONS.includes(value as (typeof SECTIONS)[number]);
}
