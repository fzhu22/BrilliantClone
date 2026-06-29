// Builds review sessions from deterministic generators (fresh numbers each time)
// instead of a fixed authored pool, so the learner never sees the exact same
// problem twice. Two modes:
//   - buildSpacedReview: spaced repetition across all DUE skills (the overall
//     daily review). Distributed practice; Dunlosky et al., 2013.
//   - buildSectionReview: on-demand practice scoped to one section's skills.
// Both interleave across skills (Rohrer et al., 2015) by round-robin generation.
// Pure (no React/Firebase), so it is easy to test.

import { generateProblem } from "@/content/generators";
import { SKILL_LABELS, type ProblemStep, type SkillId } from "@/content/types";
import { isDue, masteryOf, type SkillState } from "./mastery";

/** Default review length - kept short for an 11-14 year old on a phone. */
export const REVIEW_SESSION_SIZE = 6;

type SkillsMap = Record<string, SkillState> | undefined;

/** One generated problem plus the identity the runners need (AI-hint context). */
export interface ReviewItem {
  skill: SkillId;
  step: ProblemStep;
  lessonId: string;
  lessonTitle: string;
  stepIndex: number;
}

/**
 * Skills due for review at `now`, most-overdue first (ties broken by weaker
 * mastery). Only skills the learner has actually practiced are considered.
 */
export function getDueSkills(skills: SkillsMap, now: number): SkillId[] {
  if (!skills) return [];
  return (Object.keys(skills) as SkillId[])
    .filter((id) => isDue(skills[id], now))
    .sort((a, b) => {
      const overdue = (skills[b]?.due ?? 0) - (skills[a]?.due ?? 0); // most overdue first
      if (overdue !== 0) return overdue;
      return masteryOf(skills[a]) - masteryOf(skills[b]); // then weaker first
    });
}

/** The overall daily review: spaced repetition across all currently-due skills. */
export function buildSpacedReview(
  skills: SkillsMap,
  now: number,
  size: number = REVIEW_SESSION_SIZE,
): ReviewItem[] {
  return generateInterleaved(getDueSkills(skills, now), size);
}

/** On-demand practice scoped to one section's skills (always available). */
export function buildSectionReview(
  sectionSkills: SkillId[],
  size: number = REVIEW_SESSION_SIZE,
): ReviewItem[] {
  return generateInterleaved(sectionSkills, size);
}

/** Every skill, in canonical order. */
export const ALL_SKILLS = Object.keys(SKILL_LABELS) as SkillId[];

/**
 * Dev/testing helper: a full mixed review across every topic, ignoring the
 * spaced schedule, so a review can always be triggered on demand.
 */
export function buildDevReview(size: number = REVIEW_SESSION_SIZE): ReviewItem[] {
  return generateInterleaved(ALL_SKILLS, size);
}

// Unique id per generated item so each variant gets its own AI-hint context
// (hints are keyed by lessonId:stepIndex, so this keeps them matched to numbers).
let seq = 0;

function toItem(skill: SkillId): ReviewItem {
  return {
    skill,
    step: generateProblem(skill),
    lessonId: `review-${skill}`,
    lessonTitle: SKILL_LABELS[skill],
    stepIndex: seq++,
  };
}

/**
 * Round-robins across `skills`, generating one fresh problem per turn, so
 * consecutive problems train different skills (interleaving). With a single
 * skill it returns `size` varied problems of that one skill.
 */
function generateInterleaved(skills: SkillId[], size: number): ReviewItem[] {
  if (skills.length === 0) return [];
  const items: ReviewItem[] = [];
  for (let i = 0; items.length < size; i++) {
    items.push(toItem(skills[i % skills.length]));
  }
  return items;
}
