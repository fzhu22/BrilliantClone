// Shared mastery + scaffold helpers. The brainlift's load-bearing insight is
// that progression-gating (SPOV 6) and concreteness-fading (SPOV 1) are the SAME
// engine: both read the per-skill mastery estimate from mastery.ts. This module
// centralizes that read so the course path, the lesson runner, and the
// completion screen all decide from one source of truth. Pure (no React /
// Firebase) so it is trivial to test and reuse.

import { lessonSkills } from "@/content";
import { SKILL_LABELS, type SkillId } from "@/content/types";
import { masteryOf, SKILL_MASTERED_AT, type SkillState } from "./mastery";

export type SkillsMap = Record<string, SkillState> | undefined;

/** Every skill in the course, in canonical order. */
export const ALL_SKILL_IDS = Object.keys(SKILL_LABELS) as SkillId[];

/** A skill counts as mastered once its estimate crosses the bar (0.8). */
export function skillMastered(skills: SkillsMap, skill: SkillId): boolean {
  return masteryOf(skills?.[skill]) >= SKILL_MASTERED_AT;
}

/** How many of the course's skills are currently mastered (competence signal). */
export function masteredSkillCount(skills: SkillsMap): number {
  return ALL_SKILL_IDS.filter((id) => skillMastered(skills, id)).length;
}

/** True when every skill a lesson trains has crossed the mastery bar. */
export function lessonMastered(skills: SkillsMap, lessonId: string): boolean {
  const ids = lessonSkills(lessonId);
  if (ids.length === 0) return false;
  return ids.every((id) => skillMastered(skills, id));
}

/** Mean per-skill mastery (0..1) across a lesson's skills, for display. */
export function lessonMasteryShare(skills: SkillsMap, lessonId: string): number {
  const ids = lessonSkills(lessonId);
  if (ids.length === 0) return 0;
  const sum = ids.reduce((acc, id) => acc + masteryOf(skills?.[id]), 0);
  return sum / ids.length;
}

/** The skills in a lesson still below the mastery bar (what to review next). */
export function lessonWeakSkills(skills: SkillsMap, lessonId: string): SkillId[] {
  return lessonSkills(lessonId).filter((id) => !skillMastered(skills, id));
}

// --- Concreteness fading (SPOV 1) ---------------------------------------

/**
 * The rung a problem is shown at:
 *  - "concrete"  : the balance scale alone (novice).
 *  - "bridge"    : the scale WITH the symbolic equation beside it.
 *  - "abstract"  : the symbols alone, scale faded away (expert).
 */
export type ScaffoldLevel = "concrete" | "bridge" | "abstract";

/** Mastery at which the symbolic equation appears next to the scale. */
export const BRIDGE_AT = 0.5;
/** Mastery at which the scale fades and only symbols remain. */
export const ABSTRACT_AT = SKILL_MASTERED_AT;

/**
 * Minimum exposures before a rung is allowed to withdraw. The EWMA in
 * updateSkill() jumps to 1 after a single correct answer, so without a floor on
 * attempts a learner who nails the first problem would skip straight to bare
 * symbols. Concreteness fading must be GRADUAL (Fyfe et al., 2014), so we hold
 * each rung until there is enough evidence the support is no longer needed.
 */
export const BRIDGE_MIN_ATTEMPTS = 2;
export const ABSTRACT_MIN_ATTEMPTS = 5;

/**
 * Picks the scaffold rung for a skill from its mastery + exposure. Driven by the
 * same SkillState that gates progression, so the scaffold withdraws on a
 * mastery-tied schedule rather than a fixed lesson clock.
 */
export function scaffoldLevelFor(skill: SkillState | undefined): ScaffoldLevel {
  const mastery = masteryOf(skill);
  const attempts = skill?.attempts ?? 0;
  if (attempts >= ABSTRACT_MIN_ATTEMPTS && mastery >= ABSTRACT_AT) {
    return "abstract";
  }
  if (attempts >= BRIDGE_MIN_ATTEMPTS && mastery >= BRIDGE_AT) {
    return "bridge";
  }
  return "concrete";
}
