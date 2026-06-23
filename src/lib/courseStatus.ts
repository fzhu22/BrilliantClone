import { lessons } from "@/content";
import type { ProgressDoc } from "@/lib/progress";

export type LessonStatus = "completed" | "in-progress" | "available" | "locked";

export interface LessonState {
  id: string;
  title: string;
  tag: string;
  subtitle: string;
  status: LessonStatus;
  unlocked: boolean;
  completed: boolean;
  mastered: boolean;
  /** Completed but not yet mastered - a good candidate for review. */
  needsReview: boolean;
  accuracy?: number;
  currentStepIndex: number;
  totalSteps: number;
  recommended: boolean;
}

/**
 * Computes per-lesson state from saved progress. A lesson unlocks only when the
 * previous one is completed (sequential mastery path); the first incomplete,
 * unlocked lesson is flagged as recommended.
 */
export function computeCourse(progress: ProgressDoc): LessonState[] {
  let prevCompleted = true;

  const states: LessonState[] = lessons.map((l) => {
    const lp = progress.lessons?.[l.id];
    const completed = Boolean(lp?.completed);
    const mastered = Boolean(lp?.mastered);
    const unlocked = prevCompleted;
    const currentStepIndex = lp?.currentStepIndex ?? 0;

    let status: LessonStatus;
    if (!unlocked) status = "locked";
    else if (completed) status = "completed";
    else if (currentStepIndex > 0) status = "in-progress";
    else status = "available";

    prevCompleted = completed;

    return {
      id: l.id,
      title: l.title,
      tag: l.tag,
      subtitle: l.subtitle,
      status,
      unlocked,
      completed,
      mastered,
      needsReview: completed && !mastered,
      accuracy: lp?.accuracy,
      currentStepIndex,
      totalSteps: l.steps.length,
      recommended: false,
    };
  });

  const next = states.find((s) => s.unlocked && !s.completed);
  if (next) next.recommended = true;

  return states;
}

export function isUnlocked(lessonId: string, progress: ProgressDoc): boolean {
  return computeCourse(progress).find((s) => s.id === lessonId)?.unlocked ?? false;
}
