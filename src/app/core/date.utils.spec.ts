import { formatDuration, formatMonth, formatRange, monthsBetween, totalMonths } from './date.utils';

describe('date utils', () => {
  const now = new Date('2026-11-12');

  it('formats months and ranges', () => {
    expect(formatMonth('2024-04')).toBe('Apr 2024');
    expect(formatMonth(null)).toBe('Present');
    expect(formatRange('2024-04', '2024-11')).toBe('Apr 2024 – Nov 2024');
  });

  it('counts months inclusively', () => {
    expect(monthsBetween('2024-04', '2024-11', now)).toBe(8);
    expect(monthsBetween('2026-05', null, now)).toBe(7);
  });

  it('formats durations', () => {
    expect(formatDuration(1)).toBe('1 mo');
    expect(formatDuration(12)).toBe('1 yr');
    expect(formatDuration(30)).toBe('2 yrs 6 mos');
  });

  it('merges overlapping ranges', () => {
    expect(totalMonths([], now)).toBe(0);
    expect(totalMonths([{ start: '2020-01', end: '2020-12' }], now)).toBe(12);
    expect(
      totalMonths(
        [
          { start: '2020-01', end: '2020-06' },
          { start: '2020-06', end: '2020-12' }, // overlaps by one month
          { start: '2022-01', end: '2022-03' },
        ],
        now,
      ),
    ).toBe(15);
  });
});
