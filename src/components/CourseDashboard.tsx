"use client";

import Link from "next/link";
import { useAuth, displayName } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { getDueSkills } from "@/lib/review";
import { lessonMastered } from "@/lib/scaffold";
import { StartLearningButton } from "@/components/StartLearningButton";
import { CoursePath } from "@/components/CoursePath";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { course, lessons } from "@/content";

export function CourseDashboard() {
  const { user } = useAuth();
  const { progress } = useProgress();

  const totalLessons = lessons.length;
  // SPOV 6/7: measure progress by mastery, not mere completion.
  const masteredLessons = lessons.filter((l) =>
    lessonMastered(progress.skills, l.id),
  ).length;
  const dueCount = getDueSkills(progress.skills, Date.now()).length;

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
            Course mastery
          </h2>
          <span className="text-sm font-semibold text-brand">
            {masteredLessons} of {totalLessons} lessons mastered
          </span>
        </div>
        <ProgressBar current={masteredLessons} total={totalLessons} />
      </section>

      {dueCount > 0 && (
        <section className="mt-8">
          <Link
            href="/review"
            className="block rounded-2xl border border-brand bg-brand/5 p-4 shadow-card transition-colors hover:bg-brand/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                  Daily review &middot; all topics
                </div>
                <div className="mt-1 font-semibold text-ink">
                  {dueCount} skill{dueCount === 1 ? "" : "s"} due across your topics
                </div>
                <div className="text-sm text-muted">
                  Spaced practice mixes everything you&apos;ve learned - the best way to
                  keep it from fading.
                </div>
              </div>
              <span className="shrink-0 text-2xl" aria-hidden>
                &#128293;
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Your path
        </h2>
        <CoursePath />
      </section>
    </main>
  );
}
