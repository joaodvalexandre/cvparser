import { formatDuration, formatMonth, formatRange, monthsBetween } from './date.utils';

describe('date utils', () => {
  const now = new Date('2026-11-12');

  it('formats months and ranges', () => {
    expect(formatMonth('2024-04')).toBe('Apr 2024');
    expect(formatMonth(null)).toBe('Present');
    expect(formatRange('2024-04', '2024-11')).toBe('Apr 2024 – Nov 2024');
    expect(formatRange('2026-05', null, 'pt')).toBe('mai 2026 – Presente');
  });

  it('counts months inclusively', () => {
    expect(monthsBetween('2024-04', '2024-11', now)).toBe(8);
    expect(monthsBetween('2026-05', null, now)).toBe(7);
  });

  it('formats durations', () => {
    expect(formatDuration(1)).toBe('1 mo');
    expect(formatDuration(12)).toBe('1 yr');
    expect(formatDuration(30)).toBe('2 yrs 6 mos');
    expect(formatDuration(1, 'pt')).toBe('1 mês');
    expect(formatDuration(14, 'pt')).toBe('1 ano 2 meses');
  });

});
