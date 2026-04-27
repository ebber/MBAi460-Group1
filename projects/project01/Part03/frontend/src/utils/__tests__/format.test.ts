import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { fmtBytes, fmtDate, fmtDateRel } from '../format';

describe('fmtBytes', () => {
  it('formats sub-KB values with the B unit', () => {
    expect(fmtBytes(0)).toBe('0 B');
    expect(fmtBytes(1)).toBe('1 B');
    expect(fmtBytes(500)).toBe('500 B');
    expect(fmtBytes(1023)).toBe('1023 B');
  });

  it('formats KB / MB / GB at unit boundaries', () => {
    expect(fmtBytes(1024)).toBe('1 KB');
    expect(fmtBytes(1048576)).toBe('1 MB');
    expect(fmtBytes(1073741824)).toBe('1 GB');
  });

  it('uses one decimal for non-boundary values', () => {
    expect(fmtBytes(1536)).toBe('1.5 KB');
    expect(fmtBytes(1572864)).toBe('1.5 MB');
  });
});

describe('fmtDate', () => {
  it('returns YYYY-MM-DD for a Date instance using UTC parts', () => {
    expect(fmtDate(new Date('2026-04-27T12:00:00Z'))).toMatch(/2026-04-27/);
  });

  it('accepts an ISO string and returns YYYY-MM-DD', () => {
    expect(fmtDate('2026-01-05T00:00:00Z')).toBe('2026-01-05');
  });
});

describe('fmtDateRel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-27T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for a date a few seconds in the past', () => {
    const fiveSecondsAgo = new Date(Date.now() - 5_000);
    expect(fmtDateRel(fiveSecondsAgo)).toBe('just now');
  });

  it('returns "Nm ago" within the hour', () => {
    const fifteenMinAgo = new Date(Date.now() - 15 * 60_000);
    expect(fmtDateRel(fifteenMinAgo)).toBe('15m ago');
  });

  it('returns "5d ago" five days in the past', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60_000);
    expect(fmtDateRel(fiveDaysAgo)).toBe('5d ago');
  });

  it('returns "Nw ago" inside the four-week window', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60_000);
    expect(fmtDateRel(twoWeeksAgo)).toBe('2w ago');
  });

  it('returns "2y ago" for a date two years in the past', () => {
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60_000);
    expect(fmtDateRel(twoYearsAgo)).toBe('2y ago');
  });
});
