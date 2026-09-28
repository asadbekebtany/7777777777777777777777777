import { buildSeries } from "@/lib/metrics";
import type {
  Activity,
  Campaign,
  Employee,
  Notice,
  Order,
  Payout,
  Product,
  Promo,
  PromoCode,
  ReturnRequest,
  Review,
  Settings,
  Store,
  Wallet,
} from "@/lib/types";

export const ROLE_ACCESS = {
  owner: ["orders", "products", "returns", "reviews", "promotion", "analytics", "finance", "settings", "ai"],
  manager: ["orders", "products", "returns", "reviews", "ai"],
  content: ["products", "ai"],
  marketer: ["promotion", "analytics", "ai"],
  finance: ["finance", "analytics", "ai"],
} as const;

export const STORES: Store[] = [
  {
    id: "parts",
    name: "AUTO PARTS PRO",
    city: "Ташкент",
    focus: { ru: "Автозапчасти", en: "Auto parts", uz: "Avto ehtiyot qismlar" },
  },
  {
    id: "shina",
    name: "SHINA LINE",
    city: "Ташкент",
    focus: { ru: "Шины и диски", en: "Tires and wheels", uz: "Shina va disklar" },
  },
];

const partsProducts: Product[] = [
  { id: "p1", storeId: "parts", name: "Тормозные колодки Chevrolet Cobalt", sku: "AP-BRK-COB-01", oem: "95225666", brand: "Frenkit", category: "Тормозная система", price: 285000, stock: 42, status: "active", sales: 186, views: 2400, returns: 4, trend: 12, kind: "brakes" },
  { id: "p2", storeId: "parts", name: "Масляный фильтр Chevrolet Gentra", sku: "AP-OIL-GEN-04", oem: "96879797", brand: "MANN", category: "Фильтры", price: 45000, stock: 120, status: "active", sales: 310, views: 4100, returns: 2, trend: 8, kind: "filter" },
  { id: "p3", storeId: "parts", name: "Амортизатор передний Chevrolet Nexia 3", sku: "AP-SHK-NEX-12", oem: "42445822", brand: "KYB", category: "Подвеска", price: 420000, stock: 18, status: "active", sales: 74, views: 980, returns: 1, trend: 6, kind: "shock" },
  { id: "p4", storeId: "parts", name: "Свечи зажигания NGK BKR6E", sku: "AP-SPK-NGK-06", oem: "BKR6E", brand: "NGK", category: "Зажигание", price: 95000, stock: 64, status: "active", sales: 142, views: 1600, returns: 0, trend: 4, kind: "spark" },
  { id: "p5", storeId: "parts", name: "Шины 205/55 R16 Roadstone", sku: "AP-TIR-205-16", oem: "205/55R16", brand: "Roadstone", category: "Шины", price: 1250000, stock: 16, status: "active", sales: 58, views: 2200, returns: 1, trend: 15, kind: "tire" },
  { id: "p6", storeId: "parts", name: "Литые диски R17 5x114.3", sku: "AP-WHL-R17-08", oem: "R17-5x114.3", brand: "Replica", category: "Диски", price: 1890000, stock: 8, status: "active", sales: 21, views: 760, returns: 0, trend: -4, kind: "wheel" },
  { id: "p7", storeId: "parts", name: "Воздушный фильтр Chevrolet Cobalt", sku: "AP-AIR-COB-02", oem: "96950962", brand: "Filtron", category: "Фильтры", price: 62000, stock: 3, status: "active", sales: 96, views: 1300, returns: 1, trend: -6, kind: "filter", attention: "stock" },
  { id: "p8", storeId: "parts", name: "Ступичный подшипник передний Gentra", sku: "AP-HUB-GEN-03", oem: "13592064", brand: "ILJIN", category: "Подвеска", price: 185000, stock: 27, status: "active", sales: 63, views: 890, returns: 11, trend: -18, kind: "bearing", attention: "returns" },
  { id: "p9", storeId: "parts", name: "Комплект ГРМ Chevrolet Cobalt", sku: "AP-TMG-COB-01", oem: "24422964", brand: "Gates", category: "ГРМ", price: 540000, stock: 9, status: "moderation", sales: 0, views: 0, returns: 0, trend: 0, kind: "belt" },
  { id: "p10", storeId: "parts", name: "Сайлентблок рычага Gentra", sku: "AP-SLB-GEN-07", oem: "96870465", brand: "CTR", category: "Подвеска", price: 78000, stock: 40, status: "rejected", sales: 0, views: 40, returns: 0, trend: 0, kind: "bushing", rejectReason: "На фото не читается маркировка. Загрузите кадр артикула." },
  { id: "p11", storeId: "parts", name: "Коврики салона Cobalt", sku: "AP-MAT-COB-01", oem: "MAT-COB", brand: "Novline", category: "Аксессуары", price: 210000, stock: 14, status: "inactive", sales: 12, views: 540, returns: 0, trend: -22, kind: "mat" },
  { id: "p12", storeId: "parts", name: "Фильтр салона Chevrolet Nexia", sku: "AP-CAB-NEX-05", oem: "13271191", brand: "MANN", category: "Фильтры", price: 38000, stock: 0, status: "active", sales: 44, views: 1880, returns: 0, trend: -9, kind: "filter", attention: "stock" },
  { id: "p13", storeId: "parts", name: "Тормозной диск Cobalt", sku: "AP-DSC-COB-02", oem: "96950990", brand: "Zimmermann", category: "Тормозная система", price: 320000, stock: 22, status: "active", sales: 28, views: 2140, returns: 2, trend: 3, kind: "disc", attention: "conversion" },
  { id: "p14", storeId: "parts", name: "Масло моторное 5W-30, 4 л", sku: "AP-OIL-5W30-04", oem: "5W30-4", brand: "Lukoil", category: "Масла", price: 265000, stock: 36, status: "active", sales: 128, views: 2500, returns: 1, trend: 11, kind: "oil" },
];

const shinaProducts: Product[] = [
  { id: "s1", storeId: "shina", name: "Шины 205/55 R16 летние", sku: "SL-TIR-205-16", oem: "205/55R16", brand: "Roadstone", category: "Шины", price: 1250000, stock: 24, status: "active", sales: 84, views: 3200, returns: 1, trend: 14, kind: "tire" },
  { id: "s2", storeId: "shina", name: "Шины 215/60 R16 всесезонные", sku: "SL-TIR-215-16", oem: "215/60R16", brand: "Cordiant", category: "Шины", price: 980000, stock: 18, status: "active", sales: 61, views: 2100, returns: 2, trend: 5, kind: "tire" },
  { id: "s3", storeId: "shina", name: "Шины 225/45 R17 зимние", sku: "SL-TIR-225-17", oem: "225/45R17", brand: "Nokian", category: "Шины", price: 1680000, stock: 4, status: "active", sales: 33, views: 2600, returns: 0, trend: 9, kind: "tire", attention: "stock" },
  { id: "s4", storeId: "shina", name: "Литые диски R17 5x114.3", sku: "SL-WHL-R17", oem: "R17-5x114.3", brand: "Replica", category: "Диски", price: 1890000, stock: 10, status: "active", sales: 27, views: 1400, returns: 1, trend: 7, kind: "wheel" },
  { id: "s5", storeId: "shina", name: "Литые диски R16 4x100", sku: "SL-WHL-R16", oem: "R16-4x100", brand: "Tech Line", category: "Диски", price: 1420000, stock: 12, status: "active", sales: 19, views: 1680, returns: 3, trend: -11, kind: "wheel", attention: "returns" },
  { id: "s6", storeId: "shina", name: "Штампованные диски R15", sku: "SL-STL-R15", oem: "R15-4x100", brand: "Trebl", category: "Диски", price: 420000, stock: 20, status: "active", sales: 40, views: 900, returns: 0, trend: 2, kind: "wheel" },
  { id: "s7", storeId: "shina", name: "Датчик давления шин", sku: "SL-TPMS-01", oem: "TPMS-433", brand: "Autel", category: "Аксессуары", price: 185000, stock: 15, status: "moderation", sales: 0, views: 0, returns: 0, trend: 0, kind: "sensor" },
  { id: "s8", storeId: "shina", name: "Вентиль бескамерный", sku: "SL-VLV-TR414", oem: "TR414", brand: "Norma", category: "Аксессуары", price: 8000, stock: 200, status: "active", sales: 15, views: 2400, returns: 0, trend: -3, kind: "valve", attention: "conversion" },
];

const partsOrders: Order[] = [
  order("parts", "TW-10486", "2026-09-28T10:02:00+05:00", "new", "DBS", "2026-09-29T18:00:00+05:00", "Азиз Каримов", "+998 90 112 44 18", "Ташкент", "Юнусабад 4, дом 12, кв. 45", "Uzcard", [item(partsProducts[0], 1)]),
  order("parts", "TW-10485", "2026-09-28T09:22:00+05:00", "new", "FBS", "2026-09-29T16:00:00+05:00", "Мадина Юсупова", "+998 93 441 20 11", "Ташкент", "Чиланзар 16, дом 7", "Humo", [item(partsProducts[1], 2), item(partsProducts[11], 1)]),
  order("parts", "TW-10484", "2026-09-28T09:05:00+05:00", "new", "FBS", "2026-09-29T16:00:00+05:00", "Жасур Абдуллаев", "+998 97 220 18 40", "Самарканд", "Пункт выдачи, ул. Регистан 4", "Click", [item(partsProducts[3], 1)]),
  order("parts", "TW-10483", "2026-09-28T08:41:00+05:00", "new", "DBS", "2026-09-28T20:00:00+05:00", "Нигора Саидова", "+998 91 700 33 21", "Ташкент", "Мирзо-Улугбек, массив Ц-5", "Uzcard", [item(partsProducts[4], 2)]),
  order("parts", "TW-10482", "2026-09-28T08:14:00+05:00", "new", "FBS", "2026-09-29T16:00:00+05:00", "Бекзод Турсунов", "+998 88 310 55 90", "Фергана", "Пункт выдачи, ул. Мустакиллик 12", "Visa", [item(partsProducts[2], 2)]),
  order("parts", "TW-10474", "2026-09-28T07:40:00+05:00", "assembling", "FBS", "2026-09-28T16:00:00+05:00", "Камола Рахимова", "+998 90 555 12 64", "Ташкент", "Сергели 4, дом 22", "Humo", [item(partsProducts[13], 1), item(partsProducts[1], 1)], ["new"]),
  order("parts", "TW-10471", "2026-09-27T18:10:00+05:00", "assembling", "DBS", "2026-09-28T18:00:00+05:00", "Шерзод Исмаилов", "+998 94 200 77 15", "Ташкент", "Яккасарай, ул. Бабура 18", "Uzcard", [item(partsProducts[5], 1)], ["new"]),
  order("parts", "TW-10470", "2026-09-27T15:22:00+05:00", "assembling", "FBS", "2026-09-28T16:00:00+05:00", "Дилноза Холикова", "+998 93 118 40 02", "Андижан", "Пункт выдачи, ул. Навои 3", "Click", [item(partsProducts[7], 1)], ["new"]),
  order("parts", "TW-10461", "2026-09-26T12:05:00+05:00", "shipping", "FBS", "2026-09-27T16:00:00+05:00", "Отабек Назаров", "+998 97 640 11 28", "Бухара", "Пункт выдачи, ул. Ибн Сино 9", "Humo", [item(partsProducts[0], 1), item(partsProducts[12], 2)], ["new", "assembling"]),
  order("parts", "TW-10455", "2026-09-25T19:40:00+05:00", "shipping", "DBS", "2026-09-26T20:00:00+05:00", "Севара Мирзаева", "+998 90 222 90 14", "Ташкент", "Яшнабад, массив Тузель 2", "Uzcard", [item(partsProducts[4], 4)], ["new", "assembling"]),
  order("parts", "TW-10440", "2026-09-24T11:15:00+05:00", "shipping", "FBS", "2026-09-25T16:00:00+05:00", "Жахонгир Усманов", "+998 91 333 48 70", "Наманган", "Пункт выдачи, ул. Навои 21", "Click", [item(partsProducts[3], 4)], ["new", "assembling"]),
  order("parts", "TW-10421", "2026-09-22T09:30:00+05:00", "completed", "FBS", "2026-09-23T16:00:00+05:00", "Малика Юлдашева", "+998 93 101 22 45", "Ташкент", "Пункт выдачи, Юнусабад 7", "Humo", [item(partsProducts[13], 2)], ["new", "assembling", "shipping"]),
  order("parts", "TW-10408", "2026-09-18T16:12:00+05:00", "completed", "DBS", "2026-09-19T18:00:00+05:00", "Сардор Алиев", "+998 90 777 65 01", "Ташкент", "Мирабад, ул. Афросиаб 6", "Uzcard", [item(partsProducts[2], 1)], ["new", "assembling", "shipping"]),
  order("parts", "TW-10390", "2026-09-12T13:48:00+05:00", "completed", "FBS", "2026-09-13T16:00:00+05:00", "Нилуфар Каримова", "+998 97 505 33 19", "Самарканд", "Пункт выдачи, ул. Гагарина 11", "Visa", [item(partsProducts[6], 2)], ["new", "assembling", "shipping"]),
  order("parts", "TW-10371", "2026-09-08T10:05:00+05:00", "cancelled", "FBS", "2026-09-09T16:00:00+05:00", "Азиза Норматова", "+998 88 141 09 33", "Карши", "Пункт выдачи, ул. Ислама Каримова 2", "Humo", [item(partsProducts[5], 1)], ["new"]),
  order("parts", "TW-10355", "2026-09-04T17:20:00+05:00", "cancelled", "DBS", "2026-09-05T18:00:00+05:00", "Бобур Эргашев", "+998 94 616 80 27", "Ташкент", "Учтепа, массив Чиланзар", "Click", [item(partsProducts[8], 1)], ["new"]),
];

const shinaOrders: Order[] = [
  order("shina", "SL-2208", "2026-09-28T09:50:00+05:00", "new", "DBS", "2026-09-29T19:00:00+05:00", "Рустам Кадыров", "+998 90 200 11 45", "Ташкент", "Сергели 7, дом 3", "Uzcard", [item(shinaProducts[0], 4)]),
  order("shina", "SL-2207", "2026-09-28T08:20:00+05:00", "new", "FBS", "2026-09-29T16:00:00+05:00", "Гульнора Ахмедова", "+998 93 818 22 10", "Ташкент", "Пункт выдачи, Чиланзар 9", "Humo", [item(shinaProducts[3], 4)]),
  order("shina", "SL-2194", "2026-09-27T14:11:00+05:00", "assembling", "DBS", "2026-09-28T18:00:00+05:00", "Фаррух Собиров", "+998 97 300 44 18", "Ташкент", "Юнусабад 11, дом 8", "Click", [item(shinaProducts[2], 4)], ["new"]),
  order("shina", "SL-2180", "2026-09-25T11:00:00+05:00", "shipping", "FBS", "2026-09-26T16:00:00+05:00", "Лола Ибрагимова", "+998 91 555 09 72", "Самарканд", "Пункт выдачи, ул. Буюк Ипак Йули 5", "Uzcard", [item(shinaProducts[1], 4)], ["new", "assembling"]),
  order("shina", "SL-2166", "2026-09-20T12:40:00+05:00", "completed", "DBS", "2026-09-21T18:00:00+05:00", "Тимур Юсупов", "+998 90 414 77 03", "Ташкент", "Мирзо-Улугбек, дом 14", "Humo", [item(shinaProducts[5], 4)], ["new", "assembling", "shipping"]),
  order("shina", "SL-2140", "2026-09-09T09:15:00+05:00", "cancelled", "FBS", "2026-09-10T16:00:00+05:00", "Шахноза Рахимова", "+998 93 222 61 48", "Бухара", "Пункт выдачи, ул. Накшбанди 1", "Click", [item(shinaProducts[4], 4)], ["new"]),
];

const partsReturns: ReturnRequest[] = [
  ret("parts", "RT-219", "TW-10421", "Ступичный подшипник передний Gentra", "Малика Юлдашева", 185000, "Брак", "Через неделю появился гул.", "2026-09-28T09:10:00+05:00", "new"),
  ret("parts", "RT-214", "TW-10408", "Амортизатор передний Chevrolet Nexia 3", "Сардор Алиев", 420000, "Неверная деталь", "Пришёл амортизатор без отбойника, который был на фото.", "2026-09-27T19:40:00+05:00", "new"),
  ret("parts", "RT-208", "TW-10390", "Воздушный фильтр Chevrolet Cobalt", "Нилуфар Каримова", 62000, "Не подошёл", "По номеру OEM не совпал с машиной 2019 года.", "2026-09-20T11:12:00+05:00", "review"),
  ret("parts", "RT-190", "TW-10340", "Тормозные колодки Chevrolet Cobalt", "Азиз Каримов", 285000, "Повреждение при доставке", "Коробка мокрая, одна колодка сколота.", "2026-09-15T16:05:00+05:00", "approved"),
  ret("parts", "RT-176", "TW-10311", "Литые диски R17 5x114.3", "Бекзод Турсунов", 1890000, "Не подошёл размер", "Нужен был 5x105, ошибся при заказе.", "2026-09-11T13:22:00+05:00", "rejected"),
  ret("parts", "RT-151", "TW-10280", "Масло моторное 5W-30, 4 л", "Камола Рахимова", 265000, "Передумал", "Купил в сервисе сразу.", "2026-09-02T10:18:00+05:00", "completed"),
];

const shinaReturns: ReturnRequest[] = [
  ret("shina", "SR-088", "SL-2166", "Штампованные диски R15", "Тимур Юсупов", 420000, "Повреждение при доставке", "Один диск с вмятиной по ободу.", "2026-09-28T08:55:00+05:00", "new"),
  ret("shina", "SR-074", "SL-2102", "Литые диски R16 4x100", "Лола Ибрагимова", 1420000, "Брак", "Биение на балансировке.", "2026-09-18T15:30:00+05:00", "review"),
  ret("shina", "SR-060", "SL-2044", "Шины 215/60 R16 всесезонные", "Фаррух Собиров", 980000, "Не подошёл", "Нужен был профиль 55.", "2026-09-06T12:00:00+05:00", "approved"),
];

const partsReviews: Review[] = [
  rev("parts", "rv1", "p1", "Тормозные колодки Chevrolet Cobalt", "Азиз Каримов", 5, "Колодки встали как родные на Cobalt 2022. Скрипа нет, по Ташкенту приехали на следующий день.", "2026-09-27T18:20:00+05:00", { hasPhoto: true }),
  rev("parts", "rv2", "p2", "Масляный фильтр Chevrolet Gentra", "Мадина Юсупова", 4, "Фильтр подошёл. Упаковка была мятая, сам фильтр целый.", "2026-09-27T12:04:00+05:00"),
  rev("parts", "rv3", "p8", "Ступичный подшипник передний Gentra", "Отабек Назаров", 2, "Подшипник загудел через неделю. Прошу разобраться, ездить так нельзя.", "2026-09-26T21:15:00+05:00", { hasVideo: true }),
  rev("parts", "rv4", "p6", "Литые диски R17 5x114.3", "Севара Мирзаева", 3, "Диски пришли с небольшой потёртостью на одном ободе. В остальном ровные.", "2026-09-26T11:40:00+05:00", { hasPhoto: true }),
  rev("parts", "rv5", "p14", "Масло моторное 5W-30, 4 л", "Жасур Абдуллаев", 5, "Масло как на канистре, цена нормальная. Буду брать ещё на сервис.", "2026-09-25T09:12:00+05:00"),
  rev("parts", "rv6", "p4", "Свечи зажигания NGK BKR6E", "Нигора Саидова", 5, "Свечи оригинальные, завелась ровно. Спасибо за быструю сборку.", "2026-09-24T16:48:00+05:00"),
  rev("parts", "rv7", "p13", "Тормозной диск Cobalt", "Бекзод Турсунов", 4, "Диски без биения. Хотелось бы комплект с колодками одной поставкой.", "2026-09-23T13:05:00+05:00"),
  rev("parts", "rv8", "p3", "Амортизатор передний Chevrolet Nexia 3", "Шерзод Исмаилов", 1, "Один амортизатор приехал без гайки. Машину собрали не до конца.", "2026-09-22T19:33:00+05:00", { hasPhoto: true }),
  rev("parts", "rv9", "p7", "Воздушный фильтр Chevrolet Cobalt", "Дилноза Холикова", 5, "Встал без подгонки. Беру второй раз.", "2026-09-18T10:22:00+05:00", { reply: "Спасибо, Дилноза. Если будете менять салонный — напишите, подскажем номер.", replyAt: "2026-09-18T15:10:00+05:00" }),
  rev("parts", "rv10", "p5", "Шины 205/55 R16 Roadstone", "Камола Рахимова", 5, "Четыре шины приехали ровные, балансировка в сервисе прошла спокойно.", "2026-09-15T17:41:00+05:00", { reply: "Рады, что комплект сел как надо. Хороших дорог.", replyAt: "2026-09-16T09:02:00+05:00" }),
  rev("parts", "rv11", "p12", "Фильтр салона Chevrolet Nexia", "Сардор Алиев", 4, "Фильтр плотный, запаха нет. Доставка на день позже обещанного.", "2026-09-11T08:55:00+05:00", { reply: "Сардор, спасибо за честный отзыв. Срок на тот заказ сдвинул склад, сейчас сборка идёт в тот же день.", replyAt: "2026-09-11T12:30:00+05:00" }),
  rev("parts", "rv12", "p1", "Тормозные колодки Chevrolet Cobalt", "Малика Юлдашева", 5, "Тихие, без пыли за первую неделю. Рекомендую на Cobalt.", "2026-09-09T14:18:00+05:00", { reply: "Спасибо, Малика. Если понадобится диск в пару — артикул есть в карточке.", replyAt: "2026-09-09T18:00:00+05:00" }),
];

const shinaReviews: Review[] = [
  rev("shina", "sr1", "s1", "Шины 205/55 R16 летние", "Рустам Кадыров", 5, "Комплект ровный, дата производства свежая.", "2026-09-27T11:00:00+05:00", { hasPhoto: true }),
  rev("shina", "sr2", "s5", "Литые диски R16 4x100", "Лола Ибрагимова", 2, "На балансировке один диск ушёл в брак. Жду замену.", "2026-09-26T16:12:00+05:00"),
  rev("shina", "sr3", "s4", "Литые диски R17 5x114.3", "Тимур Юсупов", 4, "Выглядят дорого, крепёж подошёл. Царапина на одном колпаке.", "2026-09-21T13:40:00+05:00"),
  rev("shina", "sr4", "s2", "Шины 215/60 R16 всесезонные", "Гульнора Ахмедова", 5, "На Gentra сели идеально. Буду советовать.", "2026-09-14T09:20:00+05:00", { reply: "Спасибо, Гульнора. Если нужен второй комплект на зиму — напишите размер.", replyAt: "2026-09-14T12:00:00+05:00" }),
];

const partsEmployees: Employee[] = [
  emp("parts", "e1", "Дилшод Рахимов", "dilshod@autoparts.uz", "owner", "active", "2026-09-28T10:12:00+05:00"),
  emp("parts", "e2", "Малика Юлдашева", "malika@autoparts.uz", "manager", "active", "2026-09-28T09:40:00+05:00"),
  emp("parts", "e3", "Сардор Алиев", "sardor@autoparts.uz", "content", "active", "2026-09-27T18:05:00+05:00"),
  emp("parts", "e4", "Нилуфар Каримова", "nilufar@autoparts.uz", "marketer", "active", "2026-09-27T11:22:00+05:00"),
  emp("parts", "e5", "Жахонгир Усманов", "finance@autoparts.uz", "finance", "active", "2026-09-26T16:48:00+05:00"),
];

const shinaEmployees: Employee[] = [
  emp("shina", "se1", "Рустам Кадыров", "rustam@shinaline.uz", "owner", "active", "2026-09-28T09:05:00+05:00"),
  emp("shina", "se2", "Гульнора Ахмедова", "gulnora@shinaline.uz", "manager", "active", "2026-09-27T17:30:00+05:00"),
  emp("shina", "se3", "Фаррух Собиров", "finance@shinaline.uz", "finance", "invited", ""),
];

const activity: Activity[] = [
  act("parts", "a1", "2026-09-28T09:48:00+05:00", {
    ru: "Малика Юлдашева перевела заказ TW-10474 в сборку",
    en: "Malika Yuldasheva moved order TW-10474 to packing",
    uz: "Malika Yo'ldosheva TW-10474 buyurtmasini yig'ishga o'tkazdi",
  }),
  act("parts", "a2", "2026-09-27T18:20:00+05:00", {
    ru: "Сардор Алиев обновил фото тормозных колодок Cobalt",
    en: "Sardor Aliev updated the photo of Cobalt brake pads",
    uz: "Sardor Aliyev Cobalt tormoz kolodkalari fotosini yangiladi",
  }),
  act("parts", "a3", "2026-09-27T11:05:00+05:00", {
    ru: "Нилуфар Каримова поставила на паузу кампанию «Диски R17 — витрина»",
    en: "Nilufar Karimova paused the “R17 wheels — storefront” campaign",
    uz: "Nilufar Karimova «R17 disklar — vitrina» kampaniyasini pauzaga qo'ydi",
  }),
  act("parts", "a4", "2026-09-26T16:40:00+05:00", {
    ru: "Жахонгир Усманов скачал финансовый отчёт за август",
    en: "Jahongir Usmanov downloaded the August finance report",
    uz: "Jahongir Usmonov avgust moliyaviy hisobotini yuklab oldi",
  }),
  act("shina", "sa1", "2026-09-28T09:12:00+05:00", {
    ru: "Гульнора Ахмедова приняла заказ SL-2208",
    en: "Gulnora Akhmedova accepted order SL-2208",
    uz: "Gulnora Ahmedova SL-2208 buyurtmasini qabul qildi",
  }),
];

const notices: Notice[] = [
  note("parts", "n1", "order", "2026-09-28T10:02:00+05:00", false, "/orders?order=TW-10486", {
    ru: "Новый заказ TW-10486",
    en: "New order TW-10486",
    uz: "Yangi buyurtma TW-10486",
  }, {
    ru: "DBS · Шины и колодки ждут сборки",
    en: "DBS · waiting to be packed",
    uz: "DBS · yig'ishni kutmoqda",
  }),
  note("parts", "n2", "order", "2026-09-28T09:22:00+05:00", false, "/orders?order=TW-10485", {
    ru: "Новый заказ TW-10485",
    en: "New order TW-10485",
    uz: "Yangi buyurtma TW-10485",
  }, {
    ru: "FBS · фильтры, Ташкент",
    en: "FBS · filters, Tashkent",
    uz: "FBS · filtrlar, Toshkent",
  }),
  note("parts", "n3", "return", "2026-09-28T09:10:00+05:00", false, "/returns?id=RT-219", {
    ru: "Новый возврат RT-219",
    en: "New return RT-219",
    uz: "Yangi qaytarish RT-219",
  }, {
    ru: "Ступичный подшипник · брак",
    en: "Hub bearing · defect",
    uz: "G'ildirak podshipnigi · brak",
  }),
  note("parts", "n4", "review", "2026-09-26T21:15:00+05:00", false, "/reviews?id=rv3", {
    ru: "Отзыв без ответа · 2 звезды",
    en: "Unanswered review · 2 stars",
    uz: "Javobsiz sharh · 2 yulduz",
  }, {
    ru: "Ступичный подшипник Gentra",
    en: "Gentra hub bearing",
    uz: "Gentra g'ildirak podshipnigi",
  }),
  note("parts", "n5", "moderation", "2026-09-25T14:00:00+05:00", true, "/products?product=p2", {
    ru: "Товар прошёл модерацию",
    en: "Product passed moderation",
    uz: "Mahsulot moderatsiyadan o'tdi",
  }, {
    ru: "Масляный фильтр Chevrolet Gentra снова в продаже",
    en: "Gentra oil filter is on sale again",
    uz: "Gentra moy filtri yana sotuvda",
  }),
  note("parts", "n6", "rejected", "2026-09-24T11:20:00+05:00", false, "/products?product=p10", {
    ru: "Товар отклонён",
    en: "Product rejected",
    uz: "Mahsulot rad etildi",
  }, {
    ru: "Сайлентблок Gentra — не читается маркировка",
    en: "Gentra bushing — marking is unreadable",
    uz: "Gentra saylentbloki — markirovka o'qilmaydi",
  }),
  note("parts", "n7", "payout", "2026-09-15T09:00:00+05:00", true, "/finance?tab=payouts", {
    ru: "Выплата отправлена",
    en: "Payout sent",
    uz: "To'lov yuborildi",
  }, {
    ru: "42 000 000 сум на счёт Kapitalbank",
    en: "42 000 000 UZS to Kapitalbank",
    uz: "42 000 000 so'm Kapitalbank hisobiga",
  }),
  note("parts", "n8", "system", "2026-09-28T08:00:00+05:00", true, "/settings?section=fbs", {
    ru: "Отсечка FBS сегодня в 16:00",
    en: "FBS cut-off today at 16:00",
    uz: "FBS kesimi bugun 16:00",
  }, {
    ru: "Заказы после отсечки уедут завтрашней машиной",
    en: "Orders after cut-off leave on tomorrow’s run",
    uz: "Kesimdan keyingi buyurtmalar ertangi mashinada ketadi",
  }),
  note("parts", "n9", "ai", "2026-09-28T07:30:00+05:00", false, "/ai?q=recommendations", {
    ru: "Tawfiq AI: 3 изменения в магазине",
    en: "Tawfiq AI: 3 changes in the store",
    uz: "Tawfiq AI: do'konda 3 o'zgarish",
  }, {
    ru: "Продажи, возвраты и слабая конверсия",
    en: "Sales, returns, and weak conversion",
    uz: "Savdo, qaytarish va sust konversiya",
  }),
  note("shina", "sn1", "order", "2026-09-28T09:50:00+05:00", false, "/orders?order=SL-2208", {
    ru: "Новый заказ SL-2208",
    en: "New order SL-2208",
    uz: "Yangi buyurtma SL-2208",
  }, {
    ru: "4 шины 205/55 R16 · DBS",
    en: "4 tires 205/55 R16 · DBS",
    uz: "4 ta shina 205/55 R16 · DBS",
  }),
  note("shina", "sn2", "return", "2026-09-28T08:55:00+05:00", false, "/returns?id=SR-088", {
    ru: "Новый возврат SR-088",
    en: "New return SR-088",
    uz: "Yangi qaytarish SR-088",
  }, {
    ru: "Вмятина на штампованном диске",
    en: "Dent on a steel wheel",
    uz: "Shtamp diskda chuqurcha",
  }),
];

const campaigns: Campaign[] = [
  { id: "c1", storeId: "parts", name: "Колодки Cobalt — поиск", placement: "search", spend: 2400000, sales: 11200000, orders: 38, status: "active" },
  { id: "c2", storeId: "parts", name: "Масло 5W-30 — витрина", placement: "showcase", spend: 900000, sales: 6800000, orders: 24, status: "active" },
  { id: "c3", storeId: "parts", name: "Диски R17 — витрина", placement: "showcase", spend: 1500000, sales: 3780000, orders: 2, status: "paused" },
  { id: "sc1", storeId: "shina", name: "Лето 205/55 — поиск", placement: "search", spend: 3100000, sales: 18600000, orders: 14, status: "active" },
  { id: "sc2", storeId: "shina", name: "Диски R16 — витрина", placement: "showcase", spend: 1200000, sales: 4260000, orders: 3, status: "paused" },
];

const promos: Promo[] = [
  { id: "pr1", storeId: "parts", name: "−10% на фильтры", discount: "10%", period: "1–30 сен 2026", status: "active" },
  { id: "pr2", storeId: "parts", name: "Колодки + диск", discount: "комплект −5%", period: "15 сен – 15 окт", status: "scheduled" },
  { id: "pr3", storeId: "parts", name: "Летнее масло", discount: "8%", period: "1–31 авг 2026", status: "ended" },
  { id: "spr1", storeId: "shina", name: "Комплект из 4 шин", discount: "−7%", period: "1–30 сен 2026", status: "active" },
];

const codes: PromoCode[] = [
  { id: "pc1", storeId: "parts", code: "TAWFIQ10", discount: "10%", uses: 46, limit: 200, status: "active" },
  { id: "pc2", storeId: "parts", code: "COBALT5", discount: "5%", uses: 18, limit: 80, status: "active" },
  { id: "pc3", storeId: "parts", code: "SERVICE", discount: "3%", uses: 9, limit: 40, status: "paused" },
  { id: "spc1", storeId: "shina", code: "SHINA15", discount: "15%", uses: 11, limit: 50, status: "active" },
];

const payouts: Payout[] = [
  { id: "py1", storeId: "parts", date: "2026-09-28", amount: 12340000, status: "pending", account: "2020 8000 •• 4412" },
  { id: "py2", storeId: "parts", date: "2026-09-15", amount: 42000000, status: "paid", account: "2020 8000 •• 4412" },
  { id: "py3", storeId: "parts", date: "2026-09-01", amount: 38500000, status: "paid", account: "2020 8000 •• 4412" },
  { id: "py4", storeId: "shina", date: "2026-09-28", amount: 8900000, status: "pending", account: "2020 8000 •• 7781" },
  { id: "py5", storeId: "shina", date: "2026-09-15", amount: 27600000, status: "paid", account: "2020 8000 •• 7781" },
];

const wallets: Record<string, Wallet> = {
  parts: { available: 48750000, pending: 12340000 },
  shina: { available: 31200000, pending: 8900000 },
};

const settings: Record<string, Settings> = {
  parts: {
    storeName: "AUTO PARTS PRO",
    description: "Запчасти для Chevrolet Cobalt, Gentra и Nexia. Склад в Сергели, отгрузка по Узбекистану.",
    address: "Ташкент, Сергели, массив Сергели-4, дом 22",
    phone: "+998 71 200 45 10",
    sellerName: "Дилшод Рахимов",
    sellerPhone: "+998 90 777 10 10",
    inn: "305 887 214",
    email: "hello@autoparts.uz",
    fbsWarehouse: "Ташкент, Сергели-4, дом 22",
    fbsCutoff: "16:00",
    fbsSla: "24 часа",
    dbsZones: "Ташкент в пределах города",
    dbsCourier: "Свой курьер",
    dbsSla: "1–2 дня",
    payoutAccount: "2020 8000 1234 4412",
    payoutBank: "Kapitalbank",
    payoutSchedule: "Два раза в месяц",
    notifyOrders: true,
    notifyReturns: true,
    notifyReviews: true,
    notifyPayouts: true,
    notifyAi: true,
    twoFactor: false,
    aiTone: "friendly",
    aiAutoReply: false,
  },
  shina: {
    storeName: "SHINA LINE",
    description: "Шины и диски. Хранение комплектов и доставка по Ташкенту.",
    address: "Ташкент, Сергели, складской ряд 7",
    phone: "+998 71 255 18 40",
    sellerName: "Рустам Кадыров",
    sellerPhone: "+998 90 200 11 45",
    inn: "306 112 908",
    email: "hello@shinaline.uz",
    fbsWarehouse: "Ташкент, Сергели, ряд 7",
    fbsCutoff: "15:00",
    fbsSla: "24 часа",
    dbsZones: "Ташкент",
    dbsCourier: "Свой эвакуатор-доставщик",
    dbsSla: "день в день до 14:00",
    payoutAccount: "2020 8000 7781 0091",
    payoutBank: "Ipak Yuli Bank",
    payoutSchedule: "Каждую неделю",
    notifyOrders: true,
    notifyReturns: true,
    notifyReviews: true,
    notifyPayouts: true,
    notifyAi: true,
    twoFactor: true,
    aiTone: "neutral",
    aiAutoReply: false,
  },
};

export function createSeed() {
  return {
    products: [...partsProducts, ...shinaProducts],
    orders: [...partsOrders, ...shinaOrders],
    returns: [...partsReturns, ...shinaReturns],
    reviews: [...partsReviews, ...shinaReviews],
    employees: [...partsEmployees, ...shinaEmployees],
    activity,
    notices,
    campaigns,
    promos,
    codes,
    payouts,
    wallets,
    settings,
    series: {
      parts: buildSeries(4, 12_000_000, 340_000),
      shina: buildSeries(11, 15_000_000, 980_000),
    } as Record<string, ReturnType<typeof buildSeries>>,
  };
}

function item(product: Product, qty: number) {
  return { name: product.name, sku: product.sku, qty, price: product.price, kind: product.kind };
}

function order(
  storeId: string,
  id: string,
  createdAt: string,
  status: Order["status"],
  scheme: Order["scheme"],
  deadline: string,
  buyer: string,
  phone: string,
  city: string,
  address: string,
  payment: string,
  items: Order["items"],
  prior: Order["status"][] = [],
): Order {
  const history = [...prior, status].map((step, index) => ({
    status: step,
    at: index === prior.length ? createdAt : shift(createdAt, index - prior.length),
  }));
  return { id, storeId, createdAt, items, buyer, phone, city, address, scheme, deadline, status, payment, history };
}

function shift(iso: string, steps: number) {
  const date = new Date(iso);
  date.setHours(date.getHours() + steps * 5);
  return date.toISOString();
}

function ret(
  storeId: string,
  id: string,
  orderId: string,
  product: string,
  buyer: string,
  amount: number,
  reason: string,
  comment: string,
  createdAt: string,
  status: ReturnRequest["status"],
): ReturnRequest {
  return { id, storeId, orderId, product, buyer, amount, reason, comment, createdAt, status };
}

function rev(
  storeId: string,
  id: string,
  productId: string,
  product: string,
  buyer: string,
  rating: Review["rating"],
  text: string,
  createdAt: string,
  extra: Partial<Review> = {},
): Review {
  return { id, storeId, productId, product, buyer, rating, text, createdAt, ...extra };
}

function emp(
  storeId: string,
  id: string,
  name: string,
  email: string,
  role: Employee["role"],
  status: Employee["status"],
  lastSeen: string,
): Employee {
  return { id, storeId, name, email, role, status, lastSeen, access: [...ROLE_ACCESS[role]] };
}

function act(storeId: string, id: string, at: string, text: Activity["text"]): Activity {
  return { id, storeId, at, text };
}

function note(
  storeId: string,
  id: string,
  type: Notice["type"],
  createdAt: string,
  read: boolean,
  href: string,
  title: Notice["title"],
  body: Notice["body"],
): Notice {
  return { id, storeId, type, createdAt, read, href, title, body };
}
