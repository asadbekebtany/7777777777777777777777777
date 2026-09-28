"use client";

import { Ornament } from "@/components/ornament";
import { useSeller } from "@/components/seller-provider";
import { AIActionCard, AIMessage } from "@/components/ui/ai";
import { Button, IconButton } from "@/components/ui/button";
import { buildAiResponse, replyToReview } from "@/lib/ai";
import type { AiCard, AiMessage as Msg } from "@/lib/types";
import { uid } from "@/lib/utils";
import { ChartLine, MessageSquare, Package, Paperclip, Plus, Send, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AiView() {
  const seller = useSeller();
  const { t, chats, activeChatId, setActiveChatId, newChat, pushMessage, resolveCard, addProduct, applyDiscount, replyMany, locale, store, series, products, orders, reviews, settings, toast } = seller;
  const params = useSearchParams();
  const router = useRouter();
  const chat = chats.find((item) => item.id === activeChatId) ?? chats[0];
  const [text, setText] = useState("");
  const [file, setFile] = useState<string>("");
  const [freshId, setFreshId] = useState<string | null>(null);
  const consumed = useRef<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const quick = [
    { icon: Package, label: t.ai.quick.add, prompt: t.ai.prompts.add },
    { icon: ChartLine, label: t.ai.quick.sales, prompt: t.ai.prompts.sales },
    { icon: MessageSquare, label: t.ai.quick.reviews, prompt: t.ai.prompts.reviews },
    { icon: Wallet, label: t.ai.quick.report, prompt: t.ai.prompts.report },
    { icon: ShoppingBag, label: t.ai.quick.orders, prompt: t.ai.prompts.orders },
    { icon: Sparkles, label: t.ai.quick.growth, prompt: t.ai.prompts.growth },
  ];

  function send(value: string, attachment = file) {
    const content = value.trim();
    if (!content && !attachment) return;
    const user: Msg = { id: uid("m"), role: "user", text: content || attachment };
    pushMessage(chat.id, user);
    const result = buildAiResponse(content || t.ai.prompts.add, {
      locale,
      storeName: store.name,
      series,
      products,
      orders,
      reviews,
      tone: settings.aiTone,
    }, attachment || undefined);
    const assistant: Msg = { id: uid("m"), role: "assistant", text: result.text, cards: result.cards, suggestions: result.suggestions };
    pushMessage(chat.id, assistant);
    setFreshId(assistant.id);
    setText("");
    setFile("");
    if (result.download) {
      import("@/lib/report").then(({ downloadFinanceReport }) => {
        const days = series.filter((day) => day.date >= result.download!.from && day.date <= result.download!.to);
        downloadFinanceReport(days, locale, store.name.toLowerCase().replaceAll(" ", "-"), result.download!.from, result.download!.to);
        toast(t.toast.report);
      });
    }
  }

  useEffect(() => {
    const q = params.get("q");
    if (!q || consumed.current === q) return;
    consumed.current = q;
    send(q, "");
    router.replace("/ai");
    // The first automatic prompt should run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [chat.messages.length, freshId]);

  function confirm(messageId: string, card: Extract<AiCard, { type: "confirm" | "preview" }>) {
    if (card.resolved) return;
    if (card.action.type === "publish-product") addProduct(card.action.draft);
    if (card.action.type === "discount") applyDiscount([card.action.productId], card.action.percent);
    if (card.action.type === "reply-reviews") {
      replyMany(card.action.reviewIds.map((id) => {
        const review = reviews.find((item) => item.id === id);
        return { id, text: review ? replyToReview(review, settings.aiTone, locale) : "" };
      }));
    }
    resolveCard(chat.id, messageId, card.id, "confirmed");
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[560px]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="flex items-center justify-between px-3 py-3">
          <p className="text-sm font-medium">{t.ai.history}</p>
          <IconButton label={t.ai.newChat} onClick={() => newChat()}><Plus className="size-4" /></IconButton>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
          {chats.every((item) => !item.title) && <p className="px-2 text-sm text-muted">{t.ai.emptyHistory}</p>}
          {chats.filter((item) => item.title).map((item) => (
            <button key={item.id} type="button" onClick={() => setActiveChatId(item.id)} className={`w-full truncate rounded-xl px-3 py-2 text-left text-sm ${item.id === chat.id ? "bg-tawfiq-50 text-tawfiq-900" : "hover:bg-canvas"}`}>
              {item.title}
            </button>
          ))}
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {chat.messages.length === 0 ? (
            <div className="relative mx-auto flex h-full max-w-3xl flex-col items-center justify-center text-center">
              <Ornament className="pointer-events-none absolute inset-0 text-tawfiq-800 opacity-[0.05]" />
              <div className="relative">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-tawfiq-800 text-white">
                  <Sparkles className="size-5 text-[#e4c99a]" />
                </span>
                <p className="mt-4 text-xs tracking-[0.18em] text-tawfiq-700">TAWFIQ AI</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.ai.welcome}</h1>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">{t.ai.sub}</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {quick.map((item) => (
                    <button key={item.label} type="button" onClick={() => send(item.prompt, "")} className="flex items-center gap-2 rounded-2xl border border-line bg-white px-3 py-3 text-left text-sm shadow-card hover:border-tawfiq-300">
                      <item.icon className="size-4 text-tawfiq-700" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {chat.messages.map((message) => (
                <AIMessage key={message.id} role={message.role}>
                  <Typed text={message.text} enabled={message.id === freshId} />
                  {message.cards?.map((card, index) => (
                    <CardBlock key={index} card={card} onConfirm={() => confirm(message.id, card as Extract<AiCard, { type: "confirm" | "preview" }>)} onCancel={() => resolveCard(chat.id, message.id, "id" in card ? card.id : "", "cancelled")} />
                  ))}
                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((item) => (
                        <button key={item} type="button" className="rounded-full border border-line px-2.5 py-1 text-xs hover:bg-tawfiq-50" onClick={() => send(item, "")}>{item}</button>
                      ))}
                    </div>
                  )}
                </AIMessage>
              ))}
            </div>
          )}
        </div>
        <form
          className="border-t border-line bg-white px-4 py-3 sm:px-8"
          onSubmit={(event) => { event.preventDefault(); send(text); }}
        >
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <label className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-muted hover:bg-canvas">
              <Paperclip className="size-4" />
              <span className="sr-only">{t.ai.attach}</span>
              <input type="file" className="hidden" accept="image/*,.pdf,.csv,.xlsx" onChange={(event) => setFile(event.target.files?.[0]?.name ?? "")} />
            </label>
            <div className="min-w-0 flex-1">
              {file && <p className="mb-1 text-xs text-tawfiq-700">{file}</p>}
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(text);
                  }
                }}
                rows={1}
                placeholder={t.ai.placeholder}
                className="max-h-32 min-h-10 w-full resize-none rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-tawfiq-400"
              />
            </div>
            <Button type="submit" size="icon" aria-label={t.ai.send} disabled={!text.trim() && !file}><Send className="size-4" /></Button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted">{t.ai.safety}</p>
        </form>
      </section>
    </div>
  );
}

function Typed({ text, enabled }: { text: string; enabled: boolean }) {
  const [count, setCount] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      setCount((value) => {
        if (value >= text.length) {
          window.clearInterval(id);
          return value;
        }
        return Math.min(text.length, value + 3);
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [enabled, text]);
  const shown = enabled ? text.slice(0, count) : text;
  return <p className="whitespace-pre-wrap">{shown}{enabled && count < text.length ? "▍" : ""}</p>;
}

function CardBlock({ card, onConfirm, onCancel }: { card: AiCard; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useSeller();
  if (card.type === "stats") {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {card.items.map((item) => (
          <div key={item.label} className="rounded-xl bg-tawfiq-50 px-3 py-2">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="text-sm font-semibold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    );
  }
  if (card.type === "list") {
    return (
      <div className="mt-3 space-y-1.5">
        {card.title && <p className="text-xs font-medium text-muted">{card.title}</p>}
        {card.items.map((item) => (
          <div key={item.title + item.meta} className={`rounded-xl px-3 py-2 text-sm ${item.tone === "warning" ? "bg-warning-soft" : "bg-canvas"}`}>
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-muted">{item.meta}</p>
          </div>
        ))}
      </div>
    );
  }
  if (card.type === "links") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {card.items.map((item) => (
          <a key={item.href} href={item.href} className="rounded-full bg-tawfiq-700 px-3 py-1 text-xs text-white">{item.label}</a>
        ))}
      </div>
    );
  }
  return (
    <AIActionCard
      title={card.title}
      description={"description" in card ? card.description : undefined}
      changes={"changes" in card ? card.changes : undefined}
      lines={"lines" in card ? card.lines : undefined}
      confirmLabel={card.confirmLabel}
      cancelLabel={card.cancelLabel}
      resolved={card.resolved}
      confirmedText={t.ai.confirmed}
      cancelledText={t.ai.cancelled}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
