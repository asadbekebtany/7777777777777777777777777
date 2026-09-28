import type { Locale } from "@/lib/types";

export const TZ = "Asia/Tashkent";
export const NOW_ISO = "2026-09-28T10:30:00+05:00";

const MONTHS: Record<Locale, string[]> = {
  ru: ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  uz: ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"],
};

const MONTHS_LONG: Record<Locale, string[]> = {
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  uz: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
};

export function localeTag(locale: Locale) {
  if (locale === "en") return "en-US";
  if (locale === "uz") return "uz-UZ";
  return "ru-RU";
}

export function zonedParts(iso: string) {
  const date = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function formatNumber(n: number, locale: Locale) {
  return new Intl.NumberFormat(localeTag(locale)).format(Math.round(n));
}

export function currencyWord(locale: Locale) {
  if (locale === "en") return "UZS";
  if (locale === "uz") return "so'm";
  return "сум";
}

export function formatMoney(n: number, locale: Locale) {
  const sign = n < 0 ? "−" : "";
  return `${sign}${formatNumber(Math.abs(n), locale)} ${currencyWord(locale)}`;
}

export function formatCompact(n: number, locale: Locale) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1_000_000) {
    const value = new Intl.NumberFormat(localeTag(locale), {
      maximumFractionDigits: 1,
    }).format(abs / 1_000_000);
    const suffix = locale === "en" ? "m" : locale === "uz" ? " mln" : " млн";
    return sign + value + suffix;
  }
  return sign + formatNumber(abs, locale);
}

export function formatPercent(n: number | null, locale: Locale) {
  if (n == null || !Number.isFinite(n)) return "—";
  return (
    new Intl.NumberFormat(localeTag(locale), {
      maximumFractionDigits: 1,
      signDisplay: "exceptZero",
    }).format(n) + "%"
  );
}

export function formatDay(isoDate: string, locale: Locale) {
  const [, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[locale][m - 1]}`;
}

export function formatDayLong(isoDate: string, locale: Locale) {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS_LONG[locale][m - 1]} ${y}`;
}

export function formatDateTime(iso: string, locale: Locale) {
  const p = zonedParts(iso);
  const hh = String(p.hour).padStart(2, "0");
  const mm = String(p.minute).padStart(2, "0");
  return `${p.day} ${MONTHS[locale][p.month - 1]}, ${hh}:${mm}`;
}

export function formatClock(iso: string) {
  const p = zonedParts(iso);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

export function dayKey(iso: string) {
  const p = zonedParts(iso);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function addIsoDays(start: string, days: number) {
  const [y, m, d] = start.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function displayDateInput(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}
