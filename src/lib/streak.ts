export interface Streak {
  count: number;
  /** Local date (YYYY-MM-DD) of the last day with activity. */
  lastActiveDate: string | null;
}

/** Local calendar day key, e.g. "2026-06-22". */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / 86_400_000);
}

/**
 * Advances a streak for activity "today":
 * - same day: unchanged (idempotent)
 * - consecutive day: +1
 * - gap of 2+ days: reset to 1
 */
export function rollStreak(
  streak: Streak | undefined,
  today: string = todayKey(),
): Streak {
  if (!streak || !streak.lastActiveDate) {
    return { count: 1, lastActiveDate: today };
  }
  if (streak.lastActiveDate === today) return streak;

  const diff = daysBetween(streak.lastActiveDate, today);
  if (diff === 1) return { count: streak.count + 1, lastActiveDate: today };
  if (diff <= 0) return streak; // clock skew / past date, leave as is
  return { count: 1, lastActiveDate: today };
}
