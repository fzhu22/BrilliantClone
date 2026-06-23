"use client";

import Link from "next/link";
import { lessons } from "@/content";
import { useProgress } from "@/lib/progress";

export function StartLearningButton() {
  const { progress } = useProgress();

  // Recommend the first lesson the learner hasn't completed yet; if they've
  // finished everything, point back to the first lesson for review.
  const firstIncomplete =
    lessons.find((l) => !progress.lessons?.[l.id]?.completed) ?? lessons[0];

  const startedAny = Boolean(
    progress.lessons && Object.keys(progress.lessons).length > 0,
  );
  const label = startedAny ? "Continue learning" : "Start learning";

  return (
    <Link
      href={`/lesson/${firstIncomplete.id}`}
      className="rounded-xl bg-brand px-6 py-3 font-semibold text-bg shadow-card transition-transform hover:scale-[1.02] active:scale-95"
    >
      {label}
    </Link>
  );
}
