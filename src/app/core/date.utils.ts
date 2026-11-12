const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses `YYYY-MM` into a month index (year * 12 + month0). `null` means "now". */
export function toMonthIndex(value: string | null, now: Date = new Date()): number {
  if (!value) {
    return now.getFullYear() * 12 + now.getMonth();
  }
  const [year, month] = value.split('-').map(Number);
  return year * 12 + (month - 1);
}

/** `2024-04` -> `Apr 2024`; `null` -> `Present`. */
export function formatMonth(value: string | null): string {
  if (!value) {
    return 'Present';
  }
  const index = toMonthIndex(value);
  return `${MONTHS[index % 12]} ${Math.floor(index / 12)}`;
}

/** `Apr 2024 – Nov 2024` */
export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

/** Inclusive number of months between two `YYYY-MM` values. */
export function monthsBetween(start: string, end: string | null, now: Date = new Date()): number {
  return Math.max(1, toMonthIndex(end, now) - toMonthIndex(start, now) + 1);
}

/** `14` -> `1 yr 2 mos` */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
  return parts.join(' ') || '1 mo';
}

/** `2026-10-29T17:05:57Z` -> `2 weeks ago` */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((now.getTime() - new Date(iso).getTime()) / 1000);
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.345, 'week'], [12, 'month'], [Infinity, 'year'],
  ];
  let value = seconds;
  for (const [size, unit] of steps) {
    if (Math.abs(value) < size) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round(value), unit);
    }
    value /= size;
  }
  return '';
}
