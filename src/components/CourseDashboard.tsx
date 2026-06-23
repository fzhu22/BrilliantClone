"use client";

import { useAuth, displayName } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { StartLearningButton } from "@/components/StartLearningButton";
import { CoursePath } from "@/components/CoursePath";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { course, lessons } from "@/content";

export function CourseDashboard() {
  const { user } = useAuth();
  const { progress } = useProgress();

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(
    (l) => progress.lessons?.[l.id]?.completed,
  ).length;

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-6 py-12">
      <div className="text-center">
        <span className="mb-4 inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
          Welcome back, {displayName(user)}
        </span>
        <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl">
          Every equation is a <span className="text-brand">balance</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted">
          {course.bigConcept}
        </p>
        <div className="mt-8 flex items-center justify-center">
          <StartLearningButton />
        </div>
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Course progress
          </h2>
          <span className="text-sm font-semibold text-brand">
            {completedLessons} of {totalLessons} lessons
          </span>
        </div>
        <ProgressBar current={completedLessons} total={totalLessons} />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Your path
        </h2>
        <CoursePath />
      </section>
    </main>
  );
}
