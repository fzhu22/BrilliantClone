"use client";

import Link from "next/link";
import type { Lesson } from "@/content/types";
import type { MasteryResult } from "@/lib/ai/types";
import { getLesson, lessonSkills } from "@/content";
import { SKILL_LABELS } from "@/content/types";
import { useProgress, POINTS_PER_LESSON } from "@/lib/progress";
import { masteryOf, SKILL_MASTERED_AT } from "@/lib/mastery";
import { lessonMastered } from "@/lib/scaffold";
import { REWARDS_ENABLED } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function CompletionMilestone({
  lesson,
  nextLessonId,
  mastery,
  loading,
  onReplay,
}: {
  lesson: Lesson;
  nextLessonId?: string;
  /** AI (or heuristic fallback) mastery result for this run; null while loading. */
  mastery: MasteryResult | null;
  loading: boolean;
  onReplay: () => void;
}) {
  const { progress } = useProgress();
  const streak = progress.streak?.count ?? 0;
  const next = nextLessonId ? getLesson(nextLessonId) : undefined;

  const skills = lessonSkills(lesson.id);
  // Mastery, not completion, decides whether the next lesson opens (SPOV 6).
  const mastered = lessonMastered(progress.skills, lesson.id);

  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/15 text-4xl text-brand">
        &#9878;
      </div>
      <div>
        <h2 className="text-2xl font-bold">Lesson complete!</h2>
        <p className="mt-1 text-muted">
          You finished <span className="font-semibold text-ink">{lesson.title}</span>.
        </p>
        {/* SPOV 7: points/streak are demoted behind a flag; the competence read
            below is the real signal. */}
        {REWARDS_ENABLED && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand">
              <span aria-hidden>&#11088;</span> +{POINTS_PER_LESSON} points
            </span>
            {streak > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warn/15 px-3 py-1 text-sm font-semibold text-warn">
                <span aria-hidden>&#128293;</span> {streak}-day streak
              </span>
            )}
          </div>
        )}
      </div>

      {/* Formative per-skill read (SPOV 6): feedback as a scalpel, not a verdict.
          Says where each skill stands and what to review next, not just a grade. */}
      <div className="w-full rounded-2xl border border-border bg-surface p-4 text-left">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">
          How your skills are tracking
        </div>
        <ul className="mt-2 flex flex-col gap-1.5">
          {skills.map((id) => {
            const ok = masteryOf(progress.skills?.[id]) >= SKILL_MASTERED_AT;
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className={ok ? "text-success" : "text-info"}>
                    {ok ? "\u2713" : "\u2192"}
                  </span>
                  <span className="text-ink">{SKILL_LABELS[id]}</span>
                </span>
                <span
                  className={`font-semibold ${ok ? "text-success" : "text-info"}`}
                >
                  {ok ? "Solid" : "Review next"}
                </span>
              </li>
            );
          })}
        </ul>
        {loading ? (
          <div className="mt-3">
            <Spinner label="Sage is reviewing how you did..." />
          </div>
        ) : (
          mastery?.summary && (
            <p className="mt-3 border-t border-border pt-3 text-sm text-muted">
              {mastery.summary}
            </p>
          )
        )}
      </div>

      {/* Next step is mastery-gated (SPOV 6). Until the lesson's skills cross the
          bar, the door forward is a short practice set, not the next lesson. */}
      {mastered ? (
        next ? (
          <div className="w-full rounded-2xl border border-border bg-surface p-4 text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-info">
              Up next &mdash; {next.tag}
            </div>
            <div className="mt-1 font-semibold">{next.title}</div>
            <div className="text-sm text-muted">{next.subtitle}</div>
            <Link href={`/lesson/${next.id}`} className="mt-3 block">
              <Button className="w-full">Start next lesson</Button>
            </Link>
          </div>
        ) : (
          <p className="text-muted">
            That&apos;s the whole course &mdash; from balancing equations to graphing
            lines and reading their slope. Nicely done!
          </p>
        )
      ) : (
        <div className="w-full rounded-2xl border border-info/30 bg-info/5 p-4 text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-info">
            One more step
          </div>
          <div className="mt-1 font-semibold">
            {next ? `Practice to unlock ${next.title}` : "Practice to master this lesson"}
          </div>
          <p className="text-sm text-muted">
            A short, mixed practice set pushes these skills over the line &mdash;
            that&apos;s what {next ? "opens the next lesson" : "finishes the course"}.
          </p>
          <Link href={`/review?lesson=${lesson.id}`} className="mt-3 block">
            <Button className="w-full">Practice these skills</Button>
          </Link>
          <Button variant="secondary" onClick={onReplay} className="mt-2 w-full">
            Replay this lesson
          </Button>
        </div>
      )}

      <Link href="/" className="text-sm font-semibold text-info hover:underline">
        Back to course
      </Link>
    </div>
  );
}
