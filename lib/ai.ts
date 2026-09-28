import { formatMoney, formatPercent } from "@/lib/format";
import { customersFrom, delta, selectPeriod, sumDays } from "@/lib/metrics";
import type { AiCard, Locale, Product, Review } from "@/lib/types";

export type AiContext = {
  locale: Locale;
  storeName: string;
  series: import("@/lib/types").DayPoint[];
  products: Product[];
  orders: import("@/lib/types").Order[];
  reviews: Review[];
  tone: "friendly" | "neutral" | "formal";
};

export type AiResult = {
  text: string;
  cards?: AiCard[];
  suggestions?: string[];
  download?: { from: string; to: string };
};

const copy = {
  ru: {
    salesUp: "За 7 дней продажи выросли на {value} относительно предыдущей недели. Падения нет.",
    salesDown: "За 7 дней продажи снизились на {value}. Ниже — из чего это складывается.",
    salesFlat: "За 7 дней продажи почти не сдвинулись ({value}).",
    best: "За 30 дней сильнее всего продаются эти позиции. Считаю по количеству продаж в каталоге.",
    worst: "Слабее остальных выглядят эти активные товары. Имеет смысл проверить цену, фото и остаток.",
    money: "За сентябрь 2026 по {store} начислено следующее. Это деньги площадки, без себестоимости.",
    reviewsInfo: "Без ответа сейчас {count}. Негативные я не отправляю сам — они требуют вашего внимания.",
    reviewsPreview: "Подготовил ответы на позитивные отзывы. Негативные оставил вам.",
    orders: "Сейчас внимания требуют новые заказы: их {count}. Откройте любой и нажмите следующий шаг.",
    ordersEmpty: "Новых заказов нет. Очередь чистая.",
    addAsk: "Могу собрать карточку по фото, упаковке или накладной. Прикрепите снимок — или посмотрите, как выглядит готовый черновик.",
    addReady: "Я подготовил карточку. Фото приведу к белому фону, свет выровняю, деталь поставлю по центру. Внешний вид товара не меняю. Опубликовать?",
    discountAsk: "На какой товар сделать скидку? Напишите название, например «колодки».",
    discountReady: "Проверьте цену перед изменением.",
    discountMiss: "Не нашёл такой товар среди активных. Уточните название.",
    report: "Отчёт за август 2026 собран и скачивается. Внутри — продажи, комиссия, услуги и возвраты по дням.",
    show: "Продажи за последние 30 дней.",
    growth: "Три точки, с которых я бы начал сегодня.",
    fallback: "Могу проверить продажи, заказы, отзывы и деньги или подготовить карточку товара. Напишите задачу так, как сказали бы сотруднику.",
    attach: "Файл «{name}» получил.",
    view: "Посмотреть",
    publish: "Опубликовать",
    cancel: "Отмена",
    send: "Отправить ответы",
    apply: "Подтвердить",
    statsSales: "Продажи",
    statsOrders: "Заказы",
    statsAvg: "Средний чек",
    statsPayout: "К выплате",
    statsCommission: "Комиссия",
    statsReturns: "Возвраты",
    openOrders: "Открыть заказы",
    openReviews: "Открыть отзывы",
    openFinance: "Открыть финансы",
    openProducts: "Открыть товары",
    attention: "Требует внимания",
    positive: "Позитивный",
  },
  en: {
    salesUp: "Sales over 7 days are up {value} versus the previous week. There is no drop.",
    salesDown: "Sales over 7 days are down {value}. Here is what it is made of.",
    salesFlat: "Sales over 7 days barely moved ({value}).",
    best: "These are the strongest sellers over 30 days, counted by units in the catalog.",
    worst: "These active products are weaker than the rest. I would check price, photo, and stock.",
    money: "Here is what {store} accrued in September 2026. Marketplace money only, without cost.",
    reviewsInfo: "{count} reviews are still unanswered. I will not send negative ones myself.",
    reviewsPreview: "I drafted replies for the positive reviews and left the negative ones for you.",
    orders: "{count} new orders need attention. Open any of them and take the next step.",
    ordersEmpty: "There are no new orders. The queue is clear.",
    addAsk: "I can build a card from a photo, a package, or an invoice. Attach an image — or preview a finished draft.",
    addReady: "I prepared the card. I will clean the background, even the light, and center the part. I will not change how the product looks. Publish?",
    discountAsk: "Which product should get the discount? Name it, for example “pads”.",
    discountReady: "Check the price before it changes.",
    discountMiss: "I could not find that product among active ones. Clarify the name.",
    report: "The August 2026 report is ready and downloading. It includes daily sales, commission, services, and returns.",
    show: "Sales for the last 30 days.",
    growth: "Three places I would start today.",
    fallback: "I can check sales, orders, reviews, and money, or prepare a product card. Write the task the way you would to a teammate.",
    attach: "I received “{name}”.",
    view: "View",
    publish: "Publish",
    cancel: "Cancel",
    send: "Send replies",
    apply: "Confirm",
    statsSales: "Sales",
    statsOrders: "Orders",
    statsAvg: "Average order",
    statsPayout: "To be paid",
    statsCommission: "Commission",
    statsReturns: "Returns",
    openOrders: "Open orders",
    openReviews: "Open reviews",
    openFinance: "Open finance",
    openProducts: "Open products",
    attention: "Needs attention",
    positive: "Positive",
  },
  uz: {
    salesUp: "7 kunda savdo oldingi haftaga nisbatan {value} ga o'sdi. Tushish yo'q.",
    salesDown: "7 kunda savdo {value} ga tushdi. Pastda sabab.",
    salesFlat: "7 kunda savdo deyarli o'zgarmagan ({value}).",
    best: "30 kunda eng ko'p sotilganlar. Katalogdagi dona bo'yicha.",
    worst: "Bu faol mahsulotlar qolganlaridan sust. Narx, foto va qoldiqni tekshiring.",
    money: "{store} uchun 2026 sentabr hisobi. Bu maydoncha pullari, tannarxsiz.",
    reviewsInfo: "Hozir {count} ta sharh javobsiz. Salbiylarini o'zim yubormayman.",
    reviewsPreview: "Ijobiy sharhlarga javob tayyorladim. Salbiylarini sizga qoldirdim.",
    orders: "Hozir {count} ta yangi buyurtma e'tibor talab qiladi. Ochib, keyingi qadamni bosing.",
    ordersEmpty: "Yangi buyurtma yo'q. Navbat toza.",
    addAsk: "Kartochkani foto, qadoq yoki nakladnoy bo'yicha yig'a olaman. Rasm biriktiring — yoki tayyor qoralamani ko'ring.",
    addReady: "Kartochkani tayyorladim. Fonni tozalayman, yorug'likni tekislayman, detalni markazga qo'yaman. Tovar ko'rinishini o'zgartirmayman. Joylashtiraymi?",
    discountAsk: "Qaysi mahsulotga chegirma? Nomini yozing, masalan «kolodka».",
    discountReady: "Narx o'zgarishidan oldin tekshiring.",
    discountMiss: "Faol mahsulotlar orasida topilmadi. Nomini aniqlang.",
    report: "2026 avgust hisoboti tayyor va yuklanmoqda. Ichida kunlik savdo, komissiya, xizmat va qaytarish.",
    show: "So'nggi 30 kun savdosi.",
    growth: "Bugun boshlashim mumkin bo'lgan uchta nuqta.",
    fallback: "Savdo, buyurtma, sharh va pulni tekshira olaman yoki mahsulot kartochkasini tayyorlayman. Vazifani xodimga aytgandek yozing.",
    attach: "«{name}» faylini oldim.",
    view: "Ko'rish",
    publish: "Joylashtirish",
    cancel: "Bekor qilish",
    send: "Javoblarni yuborish",
    apply: "Tasdiqlash",
    statsSales: "Savdo",
    statsOrders: "Buyurtmalar",
    statsAvg: "O'rtacha chek",
    statsPayout: "To'lovga",
    statsCommission: "Komissiya",
    statsReturns: "Qaytarishlar",
    openOrders: "Buyurtmalarni ochish",
    openReviews: "Sharhlarni ochish",
    openFinance: "Moliyani ochish",
    openProducts: "Mahsulotlarni ochish",
    attention: "E'tibor kerak",
    positive: "Ijobiy",
  },
} as const;

export function replyToReview(review: Review, tone: AiContext["tone"], locale: Locale) {
  const name = review.buyer.split(" ")[0];
  if (locale === "en") {
    if (review.rating >= 4) return tone === "formal"
      ? `Thank you, ${name}. We are glad ${review.product} worked for you.`
      : `Thank you, ${name}. Glad ${review.product} fitted. If you need a matching part, just write.`;
    return `${name}, thank you for writing. A ${review.rating}-star review needs a person: we will check the order and come back with a real answer, not a template.`;
  }
  if (locale === "uz") {
    if (review.rating >= 4) return `${name}, rahmat. ${review.product} to'g'ri kelganidan xursandmiz. Yana kerak bo'lsa, yozing.`;
    return `${name}, yozganingiz uchun rahmat. ${review.rating} yulduzli sharhni o'zim yubormayman — buyurtmani tekshirib, aniq javob beramiz.`;
  }
  if (review.rating >= 5) {
    return tone === "formal"
      ? `${name}, благодарим за отзыв. Рады, что ${review.product} подошли.`
      : `${name}, спасибо. Рады, что ${review.product} встали как нужно. Если понадобится парная деталь — напишите, подскажем артикул.`;
  }
  if (review.rating === 4) {
    return `${name}, спасибо за конкретный отзыв. Замечание учли. Хорошо, что сам товар вас устроил — если что-то ещё вскроется, мы на связи.`;
  }
  return `${name}, спасибо, что написали сразу. Оценка ${review.rating} — это не шаблонный случай. Мы посмотрим заказ и вернёмся с решением, а не с общей фразой.`;
}

export function buildAiResponse(raw: string, ctx: AiContext, attachment?: string): AiResult {
  const q = raw.toLowerCase().replaceAll("ё", "е");
  const t = copy[ctx.locale];
  const prefix = attachment ? `${fill(t.attach, { name: attachment })} ` : "";
  const week = selectPeriod(ctx.series, "d7", { from: "", to: "" });
  const month = selectPeriod(ctx.series, "d30", { from: "", to: "" });
  const weekSum = sumDays(week.current);
  const prevWeek = sumDays(week.previous);
  const monthSum = sumDays(month.current);
  const salesDelta = delta(weekSum.sales, prevWeek.sales);

  if (match(q, ["скач", "download", "yuklab", "отчет", "отчёт", "hisobot", "report"])) {
    return { text: prefix + t.report, download: { from: "2026-08-01", to: "2026-08-31" } };
  }

  if (match(q, ["скид", "discount", "chegirma", "цен"])) {
    const product = findProduct(q, ctx.products) ?? (match(q, ["колод", "pad", "tormoz"]) ? ctx.products.find((p) => p.kind === "brakes" && p.status === "active") : undefined);
    const percent = extractPercent(q) ?? 10;
    if (!product) return { text: prefix + t.discountAsk, suggestions: ctx.products.filter((p) => p.status === "active").slice(0, 3).map((p) => p.name) };
    const nextPrice = Math.round(product.price * (1 - percent / 100));
    return {
      text: prefix + t.discountReady,
      cards: [{
        type: "confirm",
        id: `disc-${product.id}`,
        title: product.name,
        description: `${formatMoney(product.price, ctx.locale)} → ${formatMoney(nextPrice, ctx.locale)}`,
        changes: [`−${percent}%`],
        confirmLabel: t.apply,
        cancelLabel: t.cancel,
        action: { type: "discount", productId: product.id, percent, nextPrice },
      }],
    };
  }

  if (match(q, ["добав", "add a", "add new", "qo'sh", "qosh", "карточк", "publish", "выстав"])) {
    if (!attachment && match(q, ["как", "how", "qanday"]) && !match(q, ["добав", "add", "qo'sh", "qosh", "подготов", "prepare", "tayyor"])) {
      return { text: prefix + t.addAsk };
    }
    const draft = {
      name: ctx.storeName.includes("SHINA") ? "Стойка стабилизатора не нужна" : "Стойка стабилизатора Chevrolet Gentra",
      sku: "AP-STB-GEN-09",
      brand: "CTR",
      category: ctx.storeName.includes("SHINA") ? "Шины" : "Подвеска",
      price: ctx.storeName.includes("SHINA") ? 1250000 : 165000,
      stock: 8,
      kind: ctx.storeName.includes("SHINA") ? "tire" as const : "shock" as const,
      oem: ctx.storeName.includes("SHINA") ? "205/55R16" : "96870461",
      note: attachment ? attachment : "demo",
    };
    if (ctx.storeName.includes("SHINA")) {
      draft.name = "Шины 195/65 R15 летние";
      draft.sku = "SL-TIR-195-15";
      draft.brand = "Cordiant";
    }
    return {
      text: prefix + (attachment ? t.addReady : t.addReady),
      cards: [{
        type: "confirm",
        id: "publish-draft",
        title: draft.name,
        description: `${draft.brand} · ${draft.category} · OEM ${draft.oem}`,
        changes: [
          formatMoney(draft.price, ctx.locale),
          ctx.locale === "en" ? "Photo: white background, centered, light evened" : ctx.locale === "uz" ? "Foto: oq fon, markazda, yorug'lik tekis" : "Фото: белый фон, по центру, свет выровнен",
          ctx.locale === "en" ? "Status after confirm: moderation" : ctx.locale === "uz" ? "Tasdiqdan keyin: moderatsiya" : "После подтверждения: модерация",
        ],
        confirmLabel: t.publish,
        cancelLabel: t.cancel,
        action: { type: "publish-product", draft },
      }],
    };
  }

  if (match(q, ["ответ", "отзыв", "review", "reply", "sharh", "javob"])) {
    const open = ctx.reviews.filter((r) => !r.reply);
    const positive = open.filter((r) => r.rating >= 4);
    const negative = open.filter((r) => r.rating <= 3);
    if (match(q, ["подготов", "ответь", "сгенерир", "draft repl", "reply to", "javob tayyor"])) {
      const cards: AiCard[] = [];
      if (negative.length) {
        cards.push({
          type: "list",
          title: t.attention,
          items: negative.map((r) => ({ title: `${r.buyer} · ${r.rating}`, meta: r.product, tone: "warning" as const })),
        });
      }
      cards.push({
        type: "preview",
        id: "reply-batch",
        title: t.positive,
        lines: positive.slice(0, 4).map((r) => ({ title: `${r.buyer} · ${r.product}`, body: replyToReview(r, ctx.tone, ctx.locale) })),
        confirmLabel: t.send,
        cancelLabel: t.cancel,
        action: { type: "reply-reviews", reviewIds: positive.map((r) => r.id) },
      });
      return { text: prefix + t.reviewsPreview, cards };
    }
    return {
      text: prefix + fill(t.reviewsInfo, { count: open.length }),
      cards: [{
        type: "list",
        items: open.slice(0, 5).map((r) => ({
          title: `${r.buyer} · ${"★".repeat(r.rating)}`,
          meta: r.product,
          tone: r.rating <= 3 ? "warning" as const : "default" as const,
        })),
      }, { type: "links", items: [{ label: t.openReviews, href: "/reviews?tab=open" }] }],
    };
  }

  if (match(q, ["заказ", "order", "buyurt"])) {
    const fresh = ctx.orders.filter((o) => o.status === "new");
    if (!fresh.length) return { text: prefix + t.ordersEmpty, cards: [{ type: "links", items: [{ label: t.openOrders, href: "/orders" }] }] };
    return {
      text: prefix + fill(t.orders, { count: fresh.length }),
      cards: [
        { type: "list", items: fresh.slice(0, 5).map((o) => ({ title: o.id, meta: `${o.buyer} · ${o.scheme}` })) },
        { type: "links", items: [{ label: t.openOrders, href: "/orders?status=new" }] },
      ],
    };
  }

  if (match(q, ["худ", "слаб", "worse", "worst", "пада", "sust", "yomon"])) {
    const list = [...ctx.products].filter((p) => p.status === "active").sort((a, b) => a.trend - b.trend).slice(0, 4);
    return {
      text: prefix + t.worst,
      cards: [{ type: "list", items: list.map((p) => ({ title: p.name, meta: `${formatPercent(p.trend, ctx.locale)} · ${formatMoney(p.price, ctx.locale)}`, tone: "warning" as const })) }, { type: "links", items: [{ label: t.openProducts, href: "/products?attention=1" }] }],
    };
  }

  if (match(q, ["лучш", "лидер", "best", "top", "ko'p sot", "продавал"])) {
    const list = [...ctx.products].filter((p) => p.status === "active").sort((a, b) => b.sales - a.sales).slice(0, 5);
    return {
      text: prefix + t.best,
      cards: [{ type: "list", items: list.map((p) => ({ title: p.name, meta: `${p.sales} · ${formatMoney(p.price, ctx.locale)}` })) }],
    };
  }

  if (match(q, ["деньг", "сентябр", "баланс", "money", "september", "sentabr", "moliya", "получ"])) {
    const september = ctx.series.filter((d) => d.date >= "2026-09-01" && d.date <= "2026-09-28");
    const sum = sumDays(september);
    return {
      text: prefix + fill(t.money, { store: ctx.storeName }),
      cards: [{
        type: "stats",
        items: [
          { label: t.statsSales, value: formatMoney(sum.sales, ctx.locale) },
          { label: t.statsCommission, value: formatMoney(sum.commission, ctx.locale) },
          { label: t.statsReturns, value: formatMoney(sum.returnSum, ctx.locale) },
          { label: t.statsPayout, value: formatMoney(sum.payout, ctx.locale) },
        ],
      }, { type: "links", items: [{ label: t.openFinance, href: "/finance" }] }],
    };
  }

  if (match(q, ["точк", "рост", "рекомен", "growth", "o‘sish", "o'sish", "tavsiya"])) {
    const highReturn = [...ctx.products].filter((p) => p.status === "active").sort((a, b) => b.returns - a.returns)[0];
    const low = ctx.products.find((p) => p.attention === "conversion");
    return {
      text: prefix + t.growth,
      cards: [{
        type: "list",
        items: [
          { title: formatPercent(salesDelta, ctx.locale), meta: t.statsSales },
          highReturn ? { title: highReturn.name, meta: t.attention, tone: "warning" as const } : { title: "—", meta: "" },
          low ? { title: low.name, meta: ctx.locale === "en" ? "views without orders" : ctx.locale === "uz" ? "ko'rish bor, buyurtma kam" : "смотрят, но мало заказов", tone: "warning" as const } : { title: "—", meta: "" },
        ],
      }],
    };
  }

  if (match(q, ["продаж", "анализ", "analy", "savdo", "sales", "почему", "why", "tahlil"])) {
    const text = salesDelta != null && salesDelta > 1
      ? fill(t.salesUp, { value: formatPercent(salesDelta, ctx.locale) })
      : salesDelta != null && salesDelta < -1
        ? fill(t.salesDown, { value: formatPercent(Math.abs(salesDelta), ctx.locale) })
        : fill(t.salesFlat, { value: formatPercent(salesDelta, ctx.locale) });
    const buyers = customersFrom(weekSum.orders);
    return {
      text: prefix + text,
      cards: [{
        type: "stats",
        items: [
          { label: t.statsSales, value: formatMoney(weekSum.sales, ctx.locale) },
          { label: t.statsOrders, value: String(weekSum.orders) },
          { label: t.statsAvg, value: formatMoney(weekSum.avg, ctx.locale) },
          { label: t.statsReturns, value: formatMoney(weekSum.returnSum, ctx.locale) },
        ],
      }, {
        type: "list",
        items: [{ title: String(buyers.total), meta: ctx.locale === "en" ? "buyers in 7 days" : ctx.locale === "uz" ? "xaridor, 7 kun" : "покупателей за 7 дней" }],
      }],
    };
  }

  if (match(q, ["покаж", "show", "ko'rsat", "30"])) {
    return {
      text: prefix + t.show,
      cards: [{
        type: "stats",
        items: [
          { label: t.statsSales, value: formatMoney(monthSum.sales, ctx.locale) },
          { label: t.statsOrders, value: String(monthSum.orders) },
          { label: t.statsAvg, value: formatMoney(monthSum.avg, ctx.locale) },
        ],
      }],
    };
  }

  return {
    text: prefix + t.fallback,
    suggestions: [
      ctx.locale === "en" ? "Analyze sales" : ctx.locale === "uz" ? "Savdoni tahlil qil" : "Проанализируй продажи",
      ctx.locale === "en" ? "Which orders need attention?" : ctx.locale === "uz" ? "Qaysi buyurtmalar e'tibor talab qiladi?" : "Какие заказы требуют внимания?",
      ctx.locale === "en" ? "Add a product" : ctx.locale === "uz" ? "Mahsulot qo'sh" : "Добавь товар",
    ],
  };
}

function match(q: string, words: string[]) {
  return words.some((word) => q.includes(word));
}

function fill(template: string, params: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ""));
}

function extractPercent(q: string) {
  const found = q.match(/(\d{1,2})\s*%/);
  return found ? Number(found[1]) : null;
}

function findProduct(q: string, products: Product[]) {
  return products.find((product) => {
    const name = product.name.toLowerCase();
    return q.split(/\s+/).filter((w) => w.length > 4).some((word) => name.includes(word));
  });
}
