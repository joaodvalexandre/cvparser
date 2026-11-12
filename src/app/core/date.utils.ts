import { Lang, STRINGS } from './i18n';

/** Parses `YYYY-MM` into a month index (year * 12 + month0). `null` means "now". */
export function toMonthIndex(value: string | null, now: Date = new Date()): number {
  if (!value) {
    return now.getFullYear() * 12 + now.getMonth();
  }
  const [year, month] = value.split('-').map(Number);
  return year * 12 + (month - 1);
}

/** `2024-04` -> `Apr 2024` / `abr 2024`; `null` -> `Present` / `Presente`. */
export function formatMonth(value: string | null, lang: Lang = 'en'): string {
  const s = STRINGS[lang];
  if (!value) {
    return s.present;
  }
  const index = toMonthIndex(value);
  return `${s.months[index % 12]} ${Math.floor(index / 12)}`;
}

/** `Apr 2024 – Nov 2024` */
export function formatRange(start: string, end: string | null, lang: Lang = 'en'): string {
  return `${formatMonth(start, lang)} – ${formatMonth(end, lang)}`;
}

/** Inclusive number of months between two `YYYY-MM` values. */
export function monthsBetween(start: string, end: string | null, now: Date = new Date()): number {
  return Math.max(1, toMonthIndex(end, now) - toMonthIndex(start, now) + 1);
}

/** `14` -> `1 yr 2 mos` / `1 ano 2 meses` */
export function formatDuration(months: number, lang: Lang = 'en'): string {
  return STRINGS[lang].duration(Math.floor(months / 12), months % 12);
}

/** `2026-10-29T17:05:57Z` -> `2 weeks ago` / `há 2 semanas` */
export function timeAgo(iso: string, lang: Lang = 'en', now: Date = new Date()): string {
  const seconds = Math.round((now.getTime() - new Date(iso).getTime()) / 1000);
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.345, 'week'], [12, 'month'], [Infinity, 'year'],
  ];
  let value = seconds;
  for (const [size, unit] of steps) {
    if (Math.abs(value) < size) {
      return new Intl.RelativeTimeFormat(STRINGS[lang].locale, { numeric: 'auto' }).format(-Math.round(value), unit);
    }
    value /= size;
  }
  return '';
}
