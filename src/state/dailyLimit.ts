// Readings per day. Each deal of three cards uses one ("Shuffle again" included), and the count
// starts again at local midnight. Pure functions here; storage and React state are in dailyLimitStore.tsx.

export const readingsPerDay = 3;

/** One device's count: how many deals on which local day. */
export interface DailyCount {
  day: string; // local date, YYYY-MM-DD
  count: number;
}

/** Local calendar day, so the limit resets at the person's own midnight. */
export function dayKey(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Deals used today; a count from another day is 0. */
export function usedToday(saved: DailyCount | null, now: Date): number {
  return saved && saved.day === dayKey(now) ? saved.count : 0;
}

export function readingsLeft(saved: DailyCount | null, now: Date): number {
  return Math.max(0, readingsPerDay - usedToday(saved, now));
}

/** The count after one more deal today. */
export function recordReading(saved: DailyCount | null, now: Date): DailyCount {
  return { day: dayKey(now), count: usedToday(saved, now) + 1 };
}

/** Milliseconds until the next local midnight, when new readings open. */
export function msUntilReset(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

/** Parse a stored count, discarding anything malformed. */
export function parseCount(raw: string | null): DailyCount | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v && typeof v.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.day) && Number.isInteger(v.count) && v.count >= 0)
      return { day: v.day, count: v.count };
  } catch {
    // fall through
  }
  return null;
}
