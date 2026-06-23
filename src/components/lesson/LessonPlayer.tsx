"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lesson } from "@/content/types";
import { getNextLessonId } from "@/content";
import { useProgress, POINTS_PER_PROBLEM, POINTS_PER_LESSON } from "@/lib/progress";
import { isUnlocked } from "@/lib/courseStatus";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "./ProgressBar";
import { StepConcept } from "./StepConcept";
import { ProblemRunner } from "./ProblemRunner";
import { GraphRunner } from "./GraphRunner";
import { CompletionMilestone } from "./CompletionMilestone";

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const {
    progress,
    loading,
    saveStep,
    recordAttempt,
    completeLesson,
    awardPointsOnce,
    flashCorrect,
  } = useProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const hydrated = useRef(false);

  // Per-session first-try tracking for the mastery (accuracy) signal.
  const hadWrong = useRef<Record<number, boolean>>({});
  const firstTry = useRef<Record<number, boolean>>({});

  const total = lesson.steps.length;
  const problemTotal = lesson.steps.filter((s) => s.type === "problem").length;
  const step = lesson.steps[stepIndex];

  function sessionAccuracy(): number {
    if (problemTotal === 0) return 1;
    const firstTryCount = Object.values(firstTry.current).filter(Boolean).length;
    return firstTryCount / problemTotal;
  }

  // Shared by both the scale and graph runners.
  function handleAttempt(correct: boolean, mistake?: string) {
    recordAttempt(lesson.id, stepIndex, correct, mistake);
    if (!correct) {
      hadWrong.current[stepIndex] = true;
    } else {
      firstTry.current[stepIndex] = !hadWrong.current[stepIndex];
      awardPointsOnce(`${lesson.id}#${stepIndex}`, POINTS_PER_PROBLEM);
      flashCorrect();
    }
  }

  // Resume at the saved step once progress has loaded (step-level resume).
  useEffect(() => {
    if (hydrated.current || loading) return;
    hydrated.current = true;
    const lp = progress.lessons?.[lesson.id];
    if (
      lp &&
      !lp.completed &&
      typeof lp.currentStepIndex === "number" &&
      lp.currentStepIndex > 0 &&
      lp.currentStepIndex < total
    ) {
      setStepIndex(lp.currentStepIndex);
    }
  }, [loading, progress, lesson.id, total]);

  function advance() {
    if (stepIndex < total - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      saveStep(lesson.id, next);
    } else {
      setDone(true);
      completeLesson(lesson.id, sessionAccuracy());
      awardPointsOnce(`${lesson.id}#complete`, POINTS_PER_LESSON);
    }
  }

  // Replay the lesson from the start (used by "Replay to master"). The route is
  // already this lesson, so we reset state in place rather than navigating.
  function replayLesson() {
    hadWrong.current = {};
    firstTry.current = {};
    setDone(false);
    setStepIndex(0);
    saveStep(lesson.id, 0);
  }

  if (loading && !hydrated.current) return <Spinner label="Loading your progress" />;

  // Enforce the sequential path even on direct URL access.
  if (!loading && !isUnlocked(lesson.id, progress)) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <div className="text-4xl" aria-hidden>
          &#128274;
        </div>
        <h2 className="text-xl font-bold">This lesson is locked</h2>
        <p className="text-muted">
          Finish the earlier lessons first &mdash; the course builds step by step.
        </p>
        <Link href="/">
          <Button>Back to your path</Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4">
        <CompletionMilestone
          lesson={lesson}
          nextLessonId={getNextLessonId(lesson.id)}
          accuracy={sessionAccuracy()}
          onReplay={replayLesson}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-5">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-info">
        {lesson.tag} &middot; {lesson.title}
      </div>
      <div className="mb-5">
        <ProgressBar current={stepIndex} total={total} />
      </div>

      {step.type === "concept" ? (
        <StepConcept step={step} onContinue={advance} />
      ) : step.interaction === "match-line" ? (
        <GraphRunner
          key={stepIndex}
          step={step}
          onContinue={advance}
          onAttempt={handleAttempt}
        />
      ) : (
        <ProblemRunner
          key={stepIndex}
          step={step}
          onContinue={advance}
          onAttempt={handleAttempt}
        />
      )}
    </div>
  );
}
