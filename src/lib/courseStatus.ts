import { lessons } from "@/content";
import type { SkillId } from "@/content/types";
import type { ProgressDoc } from "@/lib/progress";
import {
  lessonMastered,
  lessonMasteryShare,
  lessonWeakSkills,
} from "@/lib/scaffold";

export type LessonStatus =
  | "completed"
  | "in-progress"
  | "available"
  | "locked";

export interface LessonState {
  id: string;
  title: string;
  tag: string;
  subtitle: string;
  status: LessonStatus;
  unlocked: boolean;
  completed: boolean;
  /** Every skill in this lesson is at or above the mastery bar (the real gate). */
  mastered: boolean;
  /** Completed but skills are still below the bar - practice to unlock the next. */
  needsMastery: boolean;
  /** Completed but not yet mastered - a good candidate for review. */
  needsReview: boolean;
  /** Mean per-skill mastery (0..1) for this lesson's skills. */
  masteryShare: number;
  /** Lesson skills still below the mastery bar (what to review next). */
  weakSkills: SkillId[];
  accuracy?: number;
  currentStepIndex: number;
  totalSteps: number;
  recommended: boolean;
  /** Why the lesson is locked, when it is. */
  lockedReason?: "previous-not-mastered";
}

/**
 * Computes per-lesson state from saved progress. Progression is MASTERY-gated
 * (SPOV 6): the next lesson opens only once the previous one's skills are
 * mastered, read from the per-skill knowledge-tracing estimate - not from a bare
 * "completed" flag. A lesson the learner has already started stays unlocked even
 * if an earlier skill later dips below the bar, so nobody is locked out of work
 * already in progress. The first unlocked, not-yet-mastered lesson is flagged as
 * recommended.
 */
export function computeCourse(progress: ProgressDoc): LessonState[] {
  let prevMastered = true; // the first lesson is always open

  const states: LessonState[] = lessons.map((l) => {
    const lp = progress.lessons?.[l.id];
    const completed = Boolean(lp?.completed);
    const currentStepIndex = lp?.currentStepIndex ?? 0;
    const started = completed || currentStepIndex > 0;
    const mastered = lessonMastered(progress.skills, l.id);
    const unlocked = prevMastered || started;
    const masteryShare = lessonMasteryShare(progress.skills, l.id);
    const weakSkills = lessonWeakSkills(progress.skills, l.id);

    let status: LessonStatus;
    if (!unlocked) status = "locked";
    else if (completed) status = "completed";
    else if (currentStepIndex > 0) status = "in-progress";
    else status = "available";

    const state: LessonState = {
      id: l.id,
      title: l.title,
      tag: l.tag,
      subtitle: l.subtitle,
      status,
      unlocked,
      completed,
      mastered,
      needsMastery: completed && !mastered,
      needsReview: completed && !mastered,
      masteryShare,
      weakSkills,
      accuracy: lp?.accuracy,
      currentStepIndex,
      totalSteps: l.steps.length,
      recommended: false,
      lockedReason: unlocked ? undefined : "previous-not-mastered",
    };

    prevMastered = mastered;
    return state;
  });

  // Recommend the first unlocked, not-yet-mastered lesson: either the next new
  // lesson, or a completed one that still needs practice to unlock the next.
  const next = states.find((s) => s.unlocked && !s.mastered);
  if (next) next.recommended = true;

  return states;
}

export function isUnlocked(lessonId: string, progress: ProgressDoc): boolean {
  return computeCourse(progress).find((s) => s.id === lessonId)?.unlocked ?? false;
}
