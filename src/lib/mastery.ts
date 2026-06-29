// Per-skill mastery + spaced-repetition scheduling. Pure (no React, no Firebase)
// so it is easy to test and reuse. Uses a Leitner-box scheduler: a correct
// answer promotes the skill to the next box (a longer interval before it is due
// again); a wrong answer drops it back to box 1 (due again soon).

export interface SkillState {
  /** Leitner box, 1..MAX_BOX. Higher box = longer interval until next review. */
  box: number;
  /** Smoothed correct-rate (0..1), for display + mastery decisions. */
  mastery: number;
  /** Total attempts on this skill (lessons + review). */
  attempts: number;
  /** Total correct attempts. */
  correct: number;
  /** Timestamp (ms) of the most recent attempt. */
  lastSeen: number;
  /** Timestamp (ms) when this skill is next due for review. */
  due: number;
}

const DAY_MS = 86_400_000;

/** Expanding Leitner intervals in days, indexed by (box - 1). */
export const INTERVALS_DAYS = [1, 3, 7, 16, 35] as const;
export const MAX_BOX = INTERVALS_DAYS.length;

/** Mastery (0..1) at or above which a skill counts as mastered. */
export const SKILL_MASTERED_AT = 0.8;

/** EWMA smoothing factor for the mastery estimate (higher = more reactive). */
const ALPHA = 0.4;

/** Days until a skill in `box` is due again. */
function intervalMs(box: number): number {
  const i = Math.min(Math.max(box, 1), MAX_BOX) - 1;
  return INTERVALS_DAYS[i] * DAY_MS;
}

/**
 * Folds one attempt into a skill's state. A correct answer promotes it one box
 * (longer interval); a wrong answer resets it to box 1 (due soon). `mastery` is
 * an exponential moving average of correctness.
 */
export function updateSkill(
  prev: SkillState | undefined,
  correct: boolean,
  now: number,
): SkillState {
  const base: SkillState =
    prev ?? { box: 0, mastery: 0, attempts: 0, correct: 0, lastSeen: 0, due: 0 };
  const box = correct ? Math.min(base.box + 1, MAX_BOX) : 1;
  const mastery =
    base.attempts === 0
      ? correct
        ? 1
        : 0
      : ALPHA * (correct ? 1 : 0) + (1 - ALPHA) * base.mastery;
  return {
    box,
    mastery,
    attempts: base.attempts + 1,
    correct: base.correct + (correct ? 1 : 0),
    lastSeen: now,
    due: now + intervalMs(box),
  };
}

export function masteryOf(s: SkillState | undefined): number {
  return s?.mastery ?? 0;
}

/** True when a previously-seen skill is due for review at `now`. */
export function isDue(s: SkillState | undefined, now: number): boolean {
  return Boolean(s && s.attempts > 0 && s.due <= now);
}
