export type Locale = "ru" | "en" | "uz";

export type PeriodKey = "today" | "yesterday" | "d7" | "d30" | "custom";

export type ThumbKind =
  | "brakes"
  | "filter"
  | "shock"
  | "spark"
  | "tire"
  | "wheel"
  | "bearing"
  | "belt"
  | "bushing"
  | "mat"
  | "oil"
  | "sensor"
  | "valve"
  | "disc";

export type ProductStatus = "active" | "moderation" | "rejected" | "inactive";

export type Product = {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  oem: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  sales: number;
  views: number;
  returns: number;
  trend: number;
  kind: ThumbKind;
  attention?: "stock" | "returns" | "conversion";
  rejectReason?: string;
};

export type OrderStatus = "new" | "assembling" | "shipping" | "completed" | "cancelled";
export type Scheme = "FBS" | "DBS";

export type OrderItem = {
  name: string;
  sku: string;
  qty: number;
  price: number;
  kind: ThumbKind;
};

export type Order = {
  id: string;
  storeId: string;
  createdAt: string;
  items: OrderItem[];
  buyer: string;
  phone: string;
  city: string;
  address: string;
  scheme: Scheme;
  deadline: string;
  status: OrderStatus;
  payment: string;
  history: { status: OrderStatus; at: string }[];
};

export type ReturnStatus = "new" | "review" | "approved" | "rejected" | "completed";

export type ReturnRequest = {
  id: string;
  storeId: string;
  orderId: string;
  product: string;
  buyer: string;
  amount: number;
  reason: string;
  comment: string;
  createdAt: string;
  status: ReturnStatus;
};

export type Review = {
  id: string;
  storeId: string;
  productId: string;
  product: string;
  buyer: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string;
  hasPhoto?: boolean;
  hasVideo?: boolean;
  reply?: string;
  replyAt?: string;
};

export type Role = "owner" | "manager" | "content" | "marketer" | "finance";
export type AccessKey =
  | "orders"
  | "products"
  | "returns"
  | "reviews"
  | "promotion"
  | "analytics"
  | "finance"
  | "settings"
  | "ai";

export type Employee = {
  id: string;
  storeId: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited";
  lastSeen: string;
  access: AccessKey[];
};

export type Activity = {
  id: string;
  storeId: string;
  text: Record<Locale, string>;
  at: string;
};

export type NoticeType =
  | "order"
  | "order_change"
  | "return"
  | "review"
  | "moderation"
  | "rejected"
  | "payout"
  | "system"
  | "ai";

export type Notice = {
  id: string;
  storeId: string;
  type: NoticeType;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  createdAt: string;
  read: boolean;
  href: string;
};

export type Campaign = {
  id: string;
  storeId: string;
  name: string;
  placement: "search" | "showcase";
  spend: number;
  sales: number;
  orders: number;
  status: "active" | "paused";
};

export type Promo = {
  id: string;
  storeId: string;
  name: string;
  discount: string;
  period: string;
  status: "active" | "scheduled" | "ended" | "draft";
};

export type PromoCode = {
  id: string;
  storeId: string;
  code: string;
  discount: string;
  uses: number;
  limit: number;
  status: "active" | "paused";
};

export type Payout = {
  id: string;
  storeId: string;
  date: string;
  amount: number;
  status: "paid" | "pending";
  account: string;
};

export type Store = {
  id: string;
  name: string;
  city: string;
  focus: Record<Locale, string>;
};

export type DayPoint = {
  date: string;
  sales: number;
  orders: number;
  items: number;
  returnCount: number;
  returnSum: number;
};

export type Settings = {
  storeName: string;
  description: string;
  address: string;
  phone: string;
  sellerName: string;
  sellerPhone: string;
  inn: string;
  email: string;
  fbsWarehouse: string;
  fbsCutoff: string;
  fbsSla: string;
  dbsZones: string;
  dbsCourier: string;
  dbsSla: string;
  payoutAccount: string;
  payoutBank: string;
  payoutSchedule: string;
  notifyOrders: boolean;
  notifyReturns: boolean;
  notifyReviews: boolean;
  notifyPayouts: boolean;
  notifyAi: boolean;
  twoFactor: boolean;
  aiTone: "friendly" | "neutral" | "formal";
  aiAutoReply: boolean;
};

export type ProductDraft = {
  name: string;
  sku: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  kind: ThumbKind;
  oem: string;
  note: string;
};

export type AiAction =
  | { type: "publish-product"; draft: ProductDraft }
  | { type: "discount"; productId: string; percent: number; nextPrice: number }
  | { type: "reply-reviews"; reviewIds: string[] };

export type AiCard =
  | { type: "stats"; items: { label: string; value: string }[] }
  | {
      type: "list";
      title?: string;
      items: { title: string; meta: string; tone?: "default" | "warning" }[];
    }
  | {
      type: "confirm";
      id: string;
      title: string;
      description: string;
      changes: string[];
      confirmLabel: string;
      cancelLabel: string;
      action: AiAction;
      resolved?: "confirmed" | "cancelled";
    }
  | {
      type: "preview";
      id: string;
      title: string;
      lines: { title: string; body: string }[];
      confirmLabel: string;
      cancelLabel: string;
      action: AiAction;
      resolved?: "confirmed" | "cancelled";
    }
  | { type: "links"; items: { label: string; href: string }[] };

export type AiMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: AiCard[];
  suggestions?: string[];
};

export type Chat = {
  id: string;
  title: string;
  messages: AiMessage[];
};

export type Wallet = {
  available: number;
  pending: number;
};

export type ChartPoint = {
  label: string;
  fullDate: string;
  sales: number;
  orders: number;
  items: number;
  avg: number;
  returns: number;
  prevSales: number;
  prevOrders: number;
  prevItems: number;
  prevAvg: number;
  prevReturns: number;
};

export type MetricKey = "sales" | "orders" | "items" | "avg" | "returns";
