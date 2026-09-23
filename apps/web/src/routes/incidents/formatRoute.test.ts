import { describe, it, expect } from 'vitest';
import { formatDistance, formatDuration, formatRiskPercent } from './formatRoute';

describe('formatDistance', () => {
  it('shows meters under 1km', () => {
    expect(formatDistance(850)).toBe('850 m');
  });

  it('shows kilometers with one decimal at or above 1km', () => {
    expect(formatDistance(4200)).toBe('4.2 km');
  });
});

describe('formatDuration', () => {
  it('shows minutes for under an hour', () => {
    expect(formatDuration(600)).toBe('10 min');
  });

  it('shows hours and minutes at or above 60 minutes', () => {
    expect(formatDuration(5400)).toBe('1h 30m');
  });

  it('shows <1 min for very short durations', () => {
    expect(formatDuration(30)).toBe('<1 min');
  });
});

describe('formatRiskPercent', () => {
  it('converts a 0..1 score to a rounded percentage', () => {
    expect(formatRiskPercent(0.65)).toBe('65%');
    expect(formatRiskPercent(0)).toBe('0%');
    expect(formatRiskPercent(1)).toBe('100%');
  });
});
