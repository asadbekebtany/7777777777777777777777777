import { en } from "@/lib/i18n/en";
import { ru, type Dict } from "@/lib/i18n/ru";
import { uz } from "@/lib/i18n/uz";
import type { Locale } from "@/lib/types";

export type { Dict };

export const dictionaries: Record<Locale, Dict> = { ru, en, uz };

export function fill(template: string, params: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ""));
}
