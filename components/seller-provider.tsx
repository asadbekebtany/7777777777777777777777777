"use client";

import { dictionaries } from "@/lib/i18n";
import { createSeed, STORES } from "@/lib/mock";
import type { AiCard, AiMessage, Chat, Employee, Locale, Product, ProductDraft, Promo, Settings } from "@/lib/types";
import { uid } from "@/lib/utils";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

type Toast = { id: string; title: string; description?: string; tone?: "success" | "danger" | "info" };

type SellerApi = ReturnType<typeof useSellerState>;

const SellerContext = createContext<SellerApi | null>(null);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const api = useSellerState();
  return <SellerContext.Provider value={api}>{children}</SellerContext.Provider>;
}

export function useSeller() {
  const value = useContext(SellerContext);
  if (!value) throw new Error("SellerProvider is missing");
  return value;
}

function useSellerState() {
  const seed = useMemo(() => createSeed(), []);
  const locale = useSyncExternalStore(subscribeStore, readLocale, () => "ru" as Locale);
  const collapsed = useSyncExternalStore(subscribeStore, readCollapsed, () => false);
  const [storeId, setStoreId] = useState(STORES[0].id);
  const [stores, setStores] = useState(STORES);
  const [products, setProducts] = useState(seed.products);
  const [orders, setOrders] = useState(seed.orders);
  const [returns] = useState(seed.returns);
  const [reviews, setReviews] = useState(seed.reviews);
  const [employees, setEmployees] = useState(seed.employees);
  const [activity, setActivity] = useState(seed.activity);
  const [notices, setNotices] = useState(seed.notices);
  const [campaigns, setCampaigns] = useState(seed.campaigns);
  const [promos, setPromos] = useState(seed.promos);
  const [codes, setCodes] = useState(seed.codes);
  const [settingsMap, setSettingsMap] = useState(seed.settings);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [chats, setChats] = useState<Chat[]>([{ id: "chat-1", title: "", messages: [] }]);
  const [activeChatId, setActiveChatId] = useState("chat-1");

  useEffect(() => {
    document.documentElement.lang = locale === "uz" ? "uz" : locale;
  }, [locale]);

  const t = dictionaries[locale];
  const store = stores.find((item) => item.id === storeId) ?? stores[0];
  const settings = settingsMap[storeId];

  const toast = (title: string, description?: string, tone?: Toast["tone"]) => {
    const id = uid("toast");
    setToasts((prev) => [...prev.slice(-3), { id, title, description, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3800);
  };

  const log = (text: ActivityText) => {
    setActivity((prev) => [{ id: uid("act"), storeId, at: new Date().toISOString(), text }, ...prev]);
  };

  const setLocale = (next: Locale) => {
    localStorage.setItem("tawfiq-locale", next);
    window.dispatchEvent(new Event("tawfiq-store"));
  };

  const setCollapsed = (next: boolean) => {
    localStorage.setItem("tawfiq-sidebar", next ? "1" : "0");
    window.dispatchEvent(new Event("tawfiq-store"));
  };

  const updateSettings = (patch: Partial<Settings>) => {
    setSettingsMap((prev) => ({ ...prev, [storeId]: { ...prev[storeId], ...patch } }));
    if (patch.storeName) {
      setStores((prev) => prev.map((item) => (item.id === storeId ? { ...item, name: patch.storeName! } : item)));
    }
    toast(t.toast.saved);
  };

  const addProduct = (draft: ProductDraft) => {
    const product: Product = {
      id: uid("p"),
      storeId,
      name: draft.name,
      sku: draft.sku,
      oem: draft.oem,
      brand: draft.brand,
      category: draft.category,
      price: draft.price,
      stock: draft.stock,
      status: "moderation",
      sales: 0,
      views: 0,
      returns: 0,
      trend: 0,
      kind: draft.kind,
    };
    setProducts((prev) => [product, ...prev]);
    log({
      ru: `Tawfiq AI отправил «${draft.name}» на модерацию`,
      en: `Tawfiq AI sent “${draft.name}” to moderation`,
      uz: `Tawfiq AI «${draft.name}» ni moderatsiyaga yubordi`,
    });
    toast(t.toast.published);
    return product.id;
  };

  const updateProduct = (id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const bulkDeactivate = (ids: string[]) => {
    setProducts((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, status: "inactive" } : item)));
    toast(t.toast.deactivated);
  };

  const applyDiscount = (ids: string[], percent: number) => {
    setProducts((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, price: Math.max(1000, Math.round(item.price * (1 - percent / 100))) } : item)),
    );
    toast(t.toast.discount);
  };

  const advanceOrder = (id: string) => {
    const flow = ["new", "assembling", "shipping", "completed"] as const;
    setOrders((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const index = flow.indexOf(item.status as (typeof flow)[number]);
        if (index < 0 || index === flow.length - 1) return item;
        const status = flow[index + 1];
        return { ...item, status, history: [...item.history, { status, at: new Date().toISOString() }] };
      }),
    );
    toast(t.toast.order);
  };

  const replyReview = (id: string, text: string) => {
    setReviews((prev) => prev.map((item) => (item.id === id ? { ...item, reply: text, replyAt: new Date().toISOString() } : item)));
    toast(t.toast.reply);
  };

  const replyMany = (items: { id: string; text: string }[]) => {
    const now = new Date().toISOString();
    setReviews((prev) =>
      prev.map((review) => {
        const found = items.find((item) => item.id === review.id);
        if (!found || review.reply) return review;
        return { ...review, reply: found.text, replyAt: now };
      }),
    );
    toast(t.toast.reviews);
  };

  const addEmployee = (employee: Omit<Employee, "id" | "storeId" | "status" | "lastSeen">) => {
    setEmployees((prev) => [{ ...employee, id: uid("emp"), storeId, status: "invited", lastSeen: "" }, ...prev]);
    toast(t.toast.employee);
  };

  const updateEmployee = (id: string, patch: Partial<Employee>) => {
    setEmployees((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addPromo = (promo: Omit<Promo, "id" | "storeId" | "status">) => {
    setPromos((prev) => [{ ...promo, id: uid("promo"), storeId, status: "draft" }, ...prev]);
    toast(t.toast.promo);
  };

  const toggleCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, status: item.status === "active" ? "paused" : "active" } : item)));
  };

  const toggleCode = (id: string) => {
    setCodes((prev) => prev.map((item) => (item.id === id ? { ...item, status: item.status === "active" ? "paused" : "active" } : item)));
  };

  const markNotice = (id: string) => setNotices((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  const markAllNotices = () => setNotices((prev) => prev.map((item) => (item.storeId === storeId ? { ...item, read: true } : item)));

  const newChat = () => {
    const id = uid("chat");
    setChats((prev) => [{ id, title: "", messages: [] }, ...prev]);
    setActiveChatId(id);
    return id;
  };

  const pushMessage = (chatId: string, message: AiMessage) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        const title = chat.title || (message.role === "user" ? message.text.slice(0, 48) : "");
        return { ...chat, title, messages: [...chat.messages, message] };
      }),
    );
  };

  const resolveCard = (chatId: string, messageId: string, cardId: string, resolved: "confirmed" | "cancelled") => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map((message) => {
            if (message.id !== messageId || !message.cards) return message;
            return {
              ...message,
              cards: message.cards.map((card) => (hasId(card) && card.id === cardId ? { ...card, resolved } : card)),
            };
          }),
        };
      }),
    );
  };

  const byStore = <T extends { storeId: string }>(list: T[]) => list.filter((item) => item.storeId === storeId);

  return {
    t,
    locale,
    setLocale,
    collapsed,
    setCollapsed,
    stores,
    storeId,
    setStoreId,
    store,
    series: seed.series[storeId] ?? seed.series.parts,
    wallet: seed.wallets[storeId],
    payouts: seed.payouts.filter((item) => item.storeId === storeId),
    products: byStore(products),
    orders: byStore(orders),
    returns: byStore(returns),
    reviews: byStore(reviews),
    employees: byStore(employees),
    activity: byStore(activity),
    notices: byStore(notices),
    campaigns: byStore(campaigns),
    promos: byStore(promos),
    codes: byStore(codes),
    settings,
    allProducts: products,
    toasts,
    dismissToast: (id: string) => setToasts((prev) => prev.filter((item) => item.id !== id)),
    toast,
    updateSettings,
    addProduct,
    updateProduct,
    bulkDeactivate,
    applyDiscount,
    advanceOrder,
    replyReview,
    replyMany,
    addEmployee,
    updateEmployee,
    addPromo,
    toggleCampaign,
    toggleCode,
    markNotice,
    markAllNotices,
    chats,
    activeChatId,
    setActiveChatId,
    newChat,
    pushMessage,
    resolveCard,
  };
}

type ActivityText = { ru: string; en: string; uz: string };

function subscribeStore(callback: () => void) {
  window.addEventListener("tawfiq-store", callback);
  return () => window.removeEventListener("tawfiq-store", callback);
}

function readLocale(): Locale {
  const saved = localStorage.getItem("tawfiq-locale");
  if (saved === "ru" || saved === "en" || saved === "uz") return saved;
  return "ru";
}

function readCollapsed() {
  return localStorage.getItem("tawfiq-sidebar") === "1";
}

function hasId(card: AiCard): card is Extract<AiCard, { id: string }> {
  return card.type === "confirm" || card.type === "preview";
}
