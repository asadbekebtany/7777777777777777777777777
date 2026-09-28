"use client";

import { PeriodPicker } from "@/components/period-picker";
import { Screen } from "@/components/screen";
import { useSeller } from "@/components/seller-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Field, Search, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { Tabs } from "@/components/ui/tabs";
import { replyToReview } from "@/lib/ai";
import { dayKey, formatDateTime } from "@/lib/format";
import { selectPeriod, TODAY } from "@/lib/metrics";
import type { PeriodKey, Review } from "@/lib/types";
import { Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function ReviewsView() {
  const { t, locale, reviews, products, series, settings, replyReview, replyMany, toast } = useSeller();
  const params = useSearchParams();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState(tabParam === "open" || tabParam === "answered" ? tabParam : "all");
  const [rating, setRating] = useState("all");
  const [product, setProduct] = useState("all");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<PeriodKey>("d30");
  const [range, setRange] = useState({ from: series[0]?.date ?? TODAY, to: TODAY });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [complainId, setComplainId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [batch, setBatch] = useState(false);
  const focus = params.get("id");
  const [tabKey, setTabKey] = useState(tabParam);
  if (tabKey !== tabParam) {
    setTabKey(tabParam);
    if (tabParam === "open" || tabParam === "answered" || tabParam === "all") setTab(tabParam);
  }

  const filtered = useMemo(() => {
    const allowed = new Set(selectPeriod(series, period, range).current.map((day) => day.date));
    return reviews.filter((review) => {
    if (tab === "open" && review.reply) return false;
    if (tab === "answered" && !review.reply) return false;
    if (rating !== "all" && review.rating !== Number(rating)) return false;
    if (product !== "all" && review.productId !== product) return false;
    if (!allowed.has(dayKey(review.createdAt))) return false;
    const blob = `${review.buyer} ${review.product} ${review.text}`.toLowerCase();
    return !query || blob.includes(query.toLowerCase());
  });
  }, [reviews, tab, rating, product, query, series, period, range]);

  const score = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const open = reviews.filter((review) => !review.reply);
  const positive = open.filter((review) => review.rating >= 4);

  return (
    <Screen title={t.reviews.title} subtitle={t.reviews.subtitle} actions={<PeriodPicker value={period} onChange={setPeriod} range={range} onRange={setRange} min={series[0]?.date} max={TODAY} />}>
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label={t.reviews.rating} value={score.toFixed(1)} hint={t.reviews.stars} delta={null} deltaLabel="—" />
        <StatCard label={t.reviews.count} value={String(reviews.length)} hint={t.common.forPeriod} delta={null} deltaLabel="—" />
        <StatCard label={t.reviews.unanswered} value={String(open.length)} hint={t.home.alertReviewsHint} delta={null} deltaLabel="—" invert />
      </div>
      {settings.aiAutoReply && <p className="rounded-xl border border-tawfiq-200 bg-tawfiq-50 px-3 py-2 text-sm text-tawfiq-900">{t.reviews.autoBanner}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onChange={setTab} tabs={[{ id: "all", label: t.reviews.all, count: reviews.length }, { id: "open", label: t.reviews.open, count: open.length }, { id: "answered", label: t.reviews.answered, count: reviews.length - open.length }]} />
        <Button variant="secondary" disabled={!positive.length} onClick={() => setBatch(true)}>{t.reviews.autoButton}</Button>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <Search value={query} onChange={setQuery} placeholder={t.products.search} />
        <Select ariaLabel={t.reviews.ratingFilter} value={rating} onChange={setRating} options={[{ value: "all", label: t.reviews.allRatings }, ...[5, 4, 3, 2, 1].map((value) => ({ value: String(value), label: `${value}` }))]} />
        <Select ariaLabel={t.reviews.product} value={product} onChange={setProduct} options={[{ value: "all", label: t.reviews.allProducts }, ...products.map((item) => ({ value: item.id, label: item.name }))]} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Star className="size-5" />} title={reviews.length ? t.reviews.emptyFilter : t.reviews.empty} text={reviews.length ? t.reviews.emptyFilterText : t.reviews.emptyText} />
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} highlight={focus === review.id} draft={drafts[review.id] ?? ""} onDraft={(value) => setDrafts((prev) => ({ ...prev, [review.id]: value }))} onComplain={() => setComplainId(review.id)} onSend={() => replyReview(review.id, drafts[review.id] || replyToReview(review, settings.aiTone, locale))} />
          ))}
        </div>
      )}
      <Modal open={batch} onClose={() => setBatch(false)} title={t.reviews.previewTitle} description={t.reviews.autoBanner}>
        <div className="max-h-72 space-y-2 overflow-auto">
          {positive.map((review) => (
            <div key={review.id} className="rounded-xl bg-canvas px-3 py-2 text-sm">
              <p className="text-xs text-muted">{review.buyer} · {review.product}</p>
              <p className="mt-1">{replyToReview(review, settings.aiTone, locale)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setBatch(false)}>{t.common.cancel}</Button>
          <Button onClick={() => { replyMany(positive.map((review) => ({ id: review.id, text: replyToReview(review, settings.aiTone, locale) }))); setBatch(false); }}>{t.reviews.send}</Button>
        </div>
      </Modal>
      <Modal open={Boolean(complainId)} onClose={() => setComplainId(null)} title={t.reviews.complainTitle} description={t.reviews.complainText}>
        <Field label={t.reviews.complainReason}>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setComplainId(null)}>{t.common.cancel}</Button>
          <Button onClick={() => { toast(t.toast.complain); setComplainId(null); setReason(""); }}>{t.reviews.complainSend}</Button>
        </div>
      </Modal>
    </Screen>
  );
}

function ReviewCard({
  review,
  highlight,
  draft,
  onDraft,
  onSend,
  onComplain,
}: {
  review: Review;
  highlight: boolean;
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  onComplain: () => void;
}) {
  const { t, locale, settings } = useSeller();
  const [open, setOpen] = useState(highlight || !review.reply);
  return (
    <Card className={highlight ? "border-tawfiq-400" : ""}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{review.buyer}</p>
          <p className="text-sm text-muted">{review.product}</p>
        </div>
        <div className="text-right">
          <p className="text-brass tracking-wider">{"★".repeat(review.rating)}<span className="text-line">{"★".repeat(5 - review.rating)}</span></p>
          <p className="text-xs text-muted">{formatDateTime(review.createdAt, locale)}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{review.text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {review.hasPhoto && <Badge>{t.reviews.photo}</Badge>}
        {review.hasVideo && <Badge>{t.reviews.video}</Badge>}
        {review.rating <= 3 && !review.reply && <Badge tone="red">{t.reviews.attention}</Badge>}
        {review.rating >= 4 && !review.reply && settings.aiAutoReply && <Badge tone="green">{t.reviews.autoReady}</Badge>}
      </div>
      {review.reply ? (
        <div className="mt-4 rounded-xl bg-tawfiq-50 px-3 py-3 text-sm">
          <p className="text-xs text-muted">{t.reviews.yourReply} · {review.replyAt ? formatDateTime(review.replyAt, locale) : ""}</p>
          <p className="mt-1">{review.reply}</p>
        </div>
      ) : (
        <div className="mt-4">
          {!open ? <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>{t.reviews.reply}</Button> : (
            <div className="space-y-2">
              <Textarea value={draft} onChange={(event) => onDraft(event.target.value)} placeholder={t.reviews.yourReply} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => onDraft(replyToReview(review, settings.aiTone, locale))}>{t.reviews.generate}</Button>
                <Button size="sm" onClick={onSend}>{t.reviews.send}</Button>
                <Button size="sm" variant="ghost" onClick={onComplain}>{t.reviews.complain}</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
