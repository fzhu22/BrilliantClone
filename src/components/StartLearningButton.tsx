"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { computeCourse } from "@/lib/courseStatus";

export function StartLearningButton() {
  const { progress } = useProgress();

  // Point at the recommended lesson: the first UNLOCKED lesson that isn't mastered
  // yet (mastery-gated, SPOV 6). This never sends the learner to a locked lesson,
  // and once everything is mastered it falls back to the first lesson for review.
  const states = computeCourse(progress);
  const target =
    states.find((s) => s.recommended) ??
    states.find((s) => s.unlocked) ??
    states[0];

  const startedAny = Boolean(
    progress.lessons && Object.keys(progress.lessons).length > 0,
  );
  const label = startedAny ? "Continue learning" : "Start learning";

  return (
    <Link
      href={`/lesson/${target.id}`}
      className="rounded-xl bg-brand px-6 py-3 font-semibold text-bg shadow-card transition-transform hover:scale-[1.02] active:scale-95"
    >
      {label}
    </Link>
  );
}
