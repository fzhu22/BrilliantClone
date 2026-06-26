"use client";

import Link from "next/link";
import type { Lesson } from "@/content/types";
import type { MasteryResult } from "@/lib/ai/types";
import { getLesson } from "@/content";
import { useProgress, POINTS_PER_LESSON } from "@/lib/progress";
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

  const mastered = mastery?.mastered ?? false;
  const pct = mastery?.masteryPercent ?? 0;

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
      </div>

      {/* AI mastery verdict */}
      {loading ? (
        <div className="w-full rounded-2xl border border-border bg-surface p-4">
          <Spinner label="Sage is reviewing how you did..." />
        </div>
      ) : mastered ? (
        <div className="flex w-full flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warn/15 px-4 py-1.5 text-sm font-bold text-warn">
            <span aria-hidden>&#9733;</span> Mastered! {pct}% mastery
          </span>
          {mastery?.summary && (
            <p className="max-w-sm text-sm text-muted">{mastery.summary}</p>
          )}
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-info/30 bg-info/5 p-4 text-center">
          <p className="text-sm text-ink">
            <span className="font-semibold">{pct}% mastered.</span>{" "}
            {mastery?.summary || "Replay the lesson to push your mastery higher."}
          </p>
          <Button variant="secondary" onClick={onReplay} className="mt-3">
            Replay to master
          </Button>
        </div>
      )}

      {next ? (
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
      )}

      <Link href="/" className="text-sm font-semibold text-info hover:underline">
        Back to course
      </Link>
    </div>
  );
}
