import { describe, expect, it } from 'vitest';

import { addDays, getLateDays } from '../../src/shared/utils/date.js';

describe('date utilities', () => {
  it('adds calendar duration in days', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    expect(addDays(start, 7).toISOString()).toBe('2026-01-08T00:00:00.000Z');
  });

  it('calculates late days and never returns a negative value', () => {
    const dueAt = new Date('2026-01-08T00:00:00.000Z');
    expect(getLateDays(dueAt, new Date('2026-01-10T00:00:00.000Z'))).toBe(2);
    expect(getLateDays(dueAt, new Date('2026-01-07T00:00:00.000Z'))).toBe(0);
  });
});
