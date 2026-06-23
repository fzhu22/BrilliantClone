"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { computeCourse, type LessonState } from "@/lib/courseStatus";

function StatusPill({ s }: { s: LessonState }) {
  if (s.mastered)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warn/15 px-2.5 py-0.5 text-xs font-semibold text-warn">
        <span aria-hidden>&#9733;</span> Mastered
      </span>
    );
  if (s.status === "completed")
    return (
      <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
        Completed
      </span>
    );
  if (s.status === "in-progress")
    return (
      <span className="rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-semibold text-info">
        In progress
      </span>
    );
  if (s.status === "locked")
    return (
      <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-semibold text-muted">
        Locked
      </span>
    );
  return (
    <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-semibold text-brand">
      Start
    </span>
  );
}

function Node({ s, index }: { s: LessonState; index: number }) {
  // Numbered node with a checkmark / lock indicator.
  const base =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold";
  if (s.mastered)
    return <div className={`${base} bg-warn text-bg`} aria-hidden>&#9733;</div>;
  if (s.completed)
    return <div className={`${base} bg-brand text-bg`} aria-hidden>&#10003;</div>;
  if (s.status === "locked")
    return (
      <div className={`${base} bg-surface2 text-muted`} aria-hidden>
        &#128274;
      </div>
    );
  return (
    <div className={`${base} bg-surface2 text-ink ring-2 ring-info`} aria-hidden>
      {index + 1}
    </div>
  );
}

function Card({ s, index }: { s: LessonState; index: number }) {
  const pct = s.totalSteps
    ? Math.round((s.currentStepIndex / s.totalSteps) * 100)
    : 0;

  const inner = (
    <div
      className={`flex-1 rounded-2xl border bg-surface p-4 shadow-card transition-colors ${
        s.recommended ? "border-brand" : "border-border"
      } ${s.unlocked ? "hover:bg-surface2" : "opacity-70"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-info">
          {s.tag}
        </span>
        <StatusPill s={s} />
      </div>
      <h3 className="mt-1 flex items-center gap-1.5 font-semibold">
        {s.title}
        {s.mastered && (
          <span className="text-warn" title="Mastered" aria-label="Mastered">
            &#9733;
          </span>
        )}
      </h3>
      <p className="text-sm text-muted">{s.subtitle}</p>

      {s.status === "in-progress" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-info" style={{ width: `${pct}%` }} />
        </div>
      )}

      {s.recommended && (
        <div className="mt-3 text-xs font-semibold text-brand">
          Recommended next &rarr;
        </div>
      )}

      {s.needsReview && (
        <div className="mt-3 text-xs font-semibold text-info">
          Review to master{typeof s.accuracy === "number" ? ` (${Math.round(s.accuracy * 100)}% first try)` : ""} &rarr;
        </div>
      )}
    </div>
  );

  return (
    <li className="flex items-stretch gap-3">
      <div className="flex items-center">
        <Node s={s} index={index} />
      </div>
      {s.unlocked ? (
        <Link href={`/lesson/${s.id}`} className="flex flex-1">
          {inner}
        </Link>
      ) : (
        <div
          className="flex flex-1 cursor-not-allowed"
          title="Finish the previous lesson to unlock"
        >
          {inner}
        </div>
      )}
    </li>
  );
}

export function CoursePath() {
  const { progress } = useProgress();
  const states = computeCourse(progress);

  return (
    <ol className="flex flex-col gap-3">
      {states.map((s, i) => (
        <Card key={s.id} s={s} index={i} />
      ))}
    </ol>
  );
}
