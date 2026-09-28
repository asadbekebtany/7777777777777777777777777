import { currencyWord } from "@/lib/format";
import { RATES, sumDays } from "@/lib/metrics";
import type { DayPoint, Locale } from "@/lib/types";
import { downloadCsv } from "@/lib/utils";

const HEADERS: Record<Locale, string[]> = {
  ru: ["Дата", "Тип", "Документ", "Описание", "Сумма", "Валюта"],
  en: ["Date", "Type", "Document", "Description", "Amount", "Currency"],
  uz: ["Sana", "Turi", "Hujjat", "Tavsif", "Summa", "Valyuta"],
};

const TYPES: Record<Locale, Record<string, string>> = {
  ru: {
    sale: "Продажа",
    commission: "Комиссия",
    logistics: "Логистика",
    placement: "Размещение",
    return: "Возврат",
  },
  en: {
    sale: "Sale",
    commission: "Commission",
    logistics: "Logistics",
    placement: "Placement",
    return: "Return",
  },
  uz: {
    sale: "Savdo",
    commission: "Komissiya",
    logistics: "Logistika",
    placement: "Joylash",
    return: "Qaytarish",
  },
};

const DESC: Record<Locale, Record<string, string>> = {
  ru: {
    sale: "Продажи за день",
    commission: "Комиссия Tawfiq 9%",
    logistics: "Логистика FBS/DBS",
    placement: "Размещение на витрине",
    return: "Возвраты покупателям",
  },
  en: {
    sale: "Sales for the day",
    commission: "Tawfiq commission 9%",
    logistics: "FBS/DBS logistics",
    placement: "Storefront placement",
    return: "Customer returns",
  },
  uz: {
    sale: "Kunlik savdo",
    commission: "Tawfiq komissiyasi 9%",
    logistics: "FBS/DBS logistikasi",
    placement: "Vitrina joylashuvi",
    return: "Xaridorlarga qaytarish",
  },
};

export function buildReportRows(days: DayPoint[], locale: Locale) {
  const rows: (string | number)[][] = [HEADERS[locale]];
  const currency = currencyWord(locale);
  for (const day of days) {
    const commission = Math.round(day.sales * RATES.commission);
    const logistics = Math.round(day.sales * RATES.logistics);
    const placement = Math.round(day.sales * RATES.placement);
    const lines: [string, number][] = [
      ["sale", day.sales],
      ["commission", -commission],
      ["logistics", -logistics],
      ["placement", -placement],
    ];
    if (day.returnSum) lines.push(["return", -day.returnSum]);
    lines.forEach(([type, amount], index) => {
      rows.push([
        day.date,
        TYPES[locale][type],
        `${type.slice(0, 3).toUpperCase()}-${day.date.replaceAll("-", "")}-${index + 1}`,
        DESC[locale][type],
        amount,
        currency,
      ]);
    });
  }
  const totals = sumDays(days);
  return { rows, totals };
}

export function downloadFinanceReport(
  days: DayPoint[],
  locale: Locale,
  storeSlug: string,
  from: string,
  to: string,
) {
  const { rows } = buildReportRows(days, locale);
  downloadCsv(`tawfiq-${storeSlug}-${from}-${to}.csv`, rows);
}
