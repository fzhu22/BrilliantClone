"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Lesson, ProblemStep } from "@/content/types";
import { isGraphStep, isEqualSignStep, isReflectStep } from "@/content/types";
import { getNextLessonId, lessonSkills } from "@/content";
import {
  useProgress,
  POINTS_PER_PROBLEM,
  POINTS_PER_LESSON,
  MASTERY_THRESHOLD,
  type MasteryOutcome,
} from "@/lib/progress";
import { isUnlocked } from "@/lib/courseStatus";
import { skillMastered } from "@/lib/scaffold";
import { isAiConfigured } from "@/lib/ai/client";
import { assessMastery } from "@/lib/ai/tutor";
import type { MasteryResult, MasterySummary } from "@/lib/ai/types";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "./ProgressBar";
import { StepConcept } from "./StepConcept";
import { StepWorkedExample } from "./StepWorkedExample";
import { StepReflect } from "./StepReflect";
import { ProblemRunner } from "./ProblemRunner";
import { GraphRunner } from "./GraphRunner";
import { EqualSignRunner } from "./EqualSignRunner";
import { CompletionMilestone } from "./CompletionMilestone";

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const {
    progress,
    loading,
    saveStep,
    recordAttempt,
    recordSkillAttempt,
    recordDiagnostic,
    completeLesson,
    awardPointsOnce,
    flashCorrect,
  } = useProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mastery, setMastery] = useState<MasteryResult | null>(null);
  const [masteryLoading, setMasteryLoading] = useState(false);
  const hydrated = useRef(false);

  // Per-session tracking that feeds the mastery assessment.
  const hadWrong = useRef<Record<number, boolean>>({});
  const firstTry = useRef<Record<number, boolean>>({});
  const sessionLog = useRef<Record<number, { attempts: number; mistakes: string[] }>>({});

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
    const current = lesson.steps[stepIndex];
    if (current.type === "problem") recordSkillAttempt(current.skill, correct);
    const log = (sessionLog.current[stepIndex] ??= { attempts: 0, mistakes: [] });
    log.attempts += 1;
    if (mistake) log.mistakes.push(mistake);
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

  // Fade worked examples for experts (expertise reversal, SPOV 1): if the current
  // step is a worked example for an already-mastered skill, skip past it so the
  // support withdraws on a mastery-tied schedule rather than a fixed one.
  useEffect(() => {
    const s = lesson.steps[stepIndex];
    if (
      s?.type === "worked-example" &&
      stepIndex < total - 1 &&
      skillMastered(progress.skills, s.skill)
    ) {
      const next = stepIndex + 1;
      setStepIndex(next);
      saveStep(lesson.id, next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, lesson, total, progress.skills]);

  function advance() {
    if (stepIndex < total - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      saveStep(lesson.id, next);
    } else {
      void finishLesson();
    }
  }

  /** Build the per-problem solve summary that the AI grades for mastery. */
  function buildMasterySummary(): MasterySummary {
    const problems = lesson.steps
      .map((s, idx) => ({ s, idx }))
      .filter((e): e is { s: ProblemStep; idx: number } => e.s.type === "problem")
      .map(({ s, idx }) => {
        const log = sessionLog.current[idx] ?? { attempts: 0, mistakes: [] };
        return {
          prompt: s.prompt,
          interaction: s.interaction,
          attempts: log.attempts,
          solvedFirstTry: firstTry.current[idx] ?? false,
          mistakes: log.mistakes,
        };
      });
    return { lessonTitle: lesson.title, problems };
  }

  // Finish: award points, then let the AI gauge mastery from how the lesson was
  // solved. Falls back to the first-try heuristic when AI is off or unavailable.
  async function finishLesson() {
    setDone(true);
    awardPointsOnce(`${lesson.id}#complete`, POINTS_PER_LESSON);

    const firstTryFraction = sessionAccuracy();
    const fallback: MasteryOutcome = {
      masteryPercent: Math.round(firstTryFraction * 100),
      mastered: firstTryFraction >= MASTERY_THRESHOLD,
    };

    // Record the equals-sign diagnostic when this lesson is the check (SPOV 2).
    // The relational understanding it measures gates the symbolic work that
    // follows - which mastery-gating then enforces lesson by lesson.
    if (lessonSkills(lesson.id).includes("equal-sign")) {
      recordDiagnostic(
        "equalSign",
        firstTryFraction >= MASTERY_THRESHOLD,
        Math.round(firstTryFraction * 100),
      );
    }

    if (!isAiConfigured) {
      setMastery({ ...fallback, summary: "" });
      completeLesson(lesson.id, fallback);
      return;
    }

    setMasteryLoading(true);
    const ai = await assessMastery(buildMasterySummary());
    setMasteryLoading(false);

    const result: MasteryResult = ai ?? { ...fallback, summary: "" };
    setMastery(result);
    completeLesson(lesson.id, {
      masteryPercent: result.masteryPercent,
      mastered: result.mastered,
      note: result.summary,
    });
  }

  // Replay the lesson from the start (used by "Replay to master"). The route is
  // already this lesson, so we reset state in place rather than navigating.
  function replayLesson() {
    hadWrong.current = {};
    firstTry.current = {};
    sessionLog.current = {};
    setMastery(null);
    setMasteryLoading(false);
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
          Master the earlier lessons first &mdash; the next one opens once your
          skills cross the bar, not just when a lesson is finished.
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
          mastery={mastery}
          loading={masteryLoading}
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
      ) : step.type === "worked-example" ? (
        <StepWorkedExample step={step} onContinue={advance} />
      ) : isReflectStep(step) ? (
        <StepReflect step={step} onContinue={advance} />
      ) : isGraphStep(step) ? (
        <GraphRunner
          key={stepIndex}
          step={step}
          onContinue={advance}
          onAttempt={handleAttempt}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          stepIndex={stepIndex}
        />
      ) : isEqualSignStep(step) ? (
        <EqualSignRunner
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
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          stepIndex={stepIndex}
        />
      )}
    </div>
  );
}
