"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import {
  buildSpacedReview,
  buildSectionReview,
  buildDevReview,
  type ReviewItem,
} from "@/lib/review";
import { getLesson, lessonSkills } from "@/content";
import { SKILL_LABELS, isGraphStep, isEqualSignStep, type SkillId } from "@/content/types";
import { ProblemRunner } from "@/components/lesson/ProblemRunner";
import { GraphRunner } from "@/components/lesson/GraphRunner";
import { EqualSignRunner } from "@/components/lesson/EqualSignRunner";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      {children}
    </div>
  );
}

/**
 * Review with two modes:
 *  - section (/review?lesson=ID): on-demand practice of that section's skills.
 *  - overall (/review): spaced repetition across all currently-due skills.
 * Both draw fresh, generated problem variants and update per-skill mastery on
 * every attempt, so practice also advances the spaced schedule.
 */
export function ReviewPlayer({ dev = false }: { dev?: boolean }) {
  const { user, loading: authLoading, configured } = useAuth();
  const { progress, loading, recordSkillAttempt } = useProgress();

  const [session, setSession] = useState<ReviewItem[] | null>(null);
  const [mode, setMode] = useState<"overall" | "section" | "dev">("overall");
  const [sectionTitle, setSectionTitle] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const built = useRef(false);
  const practiced = useRef<Set<SkillId>>(new Set());

  // Build the session once progress has loaded. dev -> all topics, ignoring the
  // schedule; ?lesson=<id> -> section practice; otherwise the spaced overall
  // review. Query is read client-side (static export).
  useEffect(() => {
    if (built.current || loading) return;
    built.current = true;
    if (dev) {
      setMode("dev");
      setSession(buildDevReview());
      return;
    }
    const lessonId = new URLSearchParams(window.location.search).get("lesson");
    if (lessonId) {
      setMode("section");
      setSectionTitle(getLesson(lessonId)?.title ?? null);
      setSession(buildSectionReview(lessonSkills(lessonId)));
    } else {
      setMode("overall");
      setSession(buildSpacedReview(progress.skills, Date.now()));
    }
  }, [loading, progress.skills, dev]);

  if ((configured && (authLoading || loading)) || session === null) {
    return <Spinner label="Loading your review" />;
  }

  if (!user) {
    return (
      <Centered>
        <h2 className="text-xl font-bold">Sign in to review</h2>
        <p className="text-muted">Your review schedule is tied to your account.</p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </Centered>
    );
  }

  if (session.length === 0) {
    return mode === "overall" ? (
      <Centered>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-3xl text-success">
          &#10003;
        </div>
        <h2 className="text-2xl font-bold">You&apos;re all caught up</h2>
        <p className="text-muted">
          Nothing is due across your topics right now. Come back tomorrow - spacing
          practice out is what makes it stick. You can still practice any finished
          section from your course page anytime.
        </p>
        <Link href="/">
          <Button>Back to course</Button>
        </Link>
      </Centered>
    ) : (
      <Centered>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-info/15 text-3xl text-info">
          &#128218;
        </div>
        <h2 className="text-2xl font-bold">Nothing to practice here yet</h2>
        <p className="text-muted">Finish this lesson first, then come back to practice it.</p>
        <Link href="/">
          <Button>Back to course</Button>
        </Link>
      </Centered>
    );
  }

  if (done) {
    const skills = [...practiced.current].map((id) => SKILL_LABELS[id]);
    return (
      <Centered>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/15 text-4xl text-brand">
          &#9733;
        </div>
        <h2 className="text-2xl font-bold">
          {mode === "overall" ? "Review complete!" : "Practice complete!"}
        </h2>
        <p className="text-muted">
          You practiced {session.length} problem{session.length === 1 ? "" : "s"} across{" "}
          {practiced.current.size} skill{practiced.current.size === 1 ? "" : "s"}. Each one
          is rescheduled for the right time.
        </p>
        {skills.length > 0 && (
          <p className="text-sm text-muted">Practiced: {skills.join(", ")}.</p>
        )}
        <Link href="/">
          <Button>Back to course</Button>
        </Link>
      </Centered>
    );
  }

  const ref = session[index];
  const step = ref.step;

  function onAttempt(correct: boolean) {
    recordSkillAttempt(ref.step.skill, correct);
    practiced.current.add(ref.step.skill);
  }

  function onContinue() {
    if (index < session!.length - 1) setIndex(index + 1);
    else setDone(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-5">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-info">
        {mode === "section"
          ? `Practice${sectionTitle ? ` \u00b7 ${sectionTitle}` : ""}`
          : mode === "dev"
            ? "Dev review \u00b7 all topics"
            : "Daily review \u00b7 all topics"}
      </div>
      <div className="mb-5">
        <ProgressBar current={index} total={session.length} />
      </div>

      {isGraphStep(step) ? (
        <GraphRunner
          key={index}
          step={step}
          onContinue={onContinue}
          onAttempt={onAttempt}
          lessonId={ref.lessonId}
          lessonTitle={ref.lessonTitle}
          stepIndex={ref.stepIndex}
        />
      ) : isEqualSignStep(step) ? (
        <EqualSignRunner key={index} step={step} onContinue={onContinue} onAttempt={onAttempt} />
      ) : (
        <ProblemRunner
          key={index}
          step={step}
          onContinue={onContinue}
          onAttempt={onAttempt}
          lessonId={ref.lessonId}
          lessonTitle={ref.lessonTitle}
          stepIndex={ref.stepIndex}
        />
      )}
    </div>
  );
}
