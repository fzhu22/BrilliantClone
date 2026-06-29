"use client";

import { useState } from "react";
import type { EqualSignProblemStep } from "@/content/types";
import {
  validate,
  feedbackFor,
  type Attempt,
  type ValidationResult,
} from "@/content/validators";
import { Button } from "@/components/ui/Button";
import { NumberPad } from "@/components/ui/NumberPad";
import { FeedbackBanner } from "./FeedbackBanner";
import { AvatarCoach } from "./AvatarCoach";

/** Renders the equation, drawing the blank as a highlighted box for fill-blank. */
function EquationDisplay({ equation }: { equation: string }) {
  const parts = equation.split("?");
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 font-mono text-3xl font-bold tracking-wide text-ink">
      {parts.map((p, i) => (
        <span key={i} className="whitespace-pre">
          {p}
          {i < parts.length - 1 && (
            <span className="mx-1 inline-block min-w-[2ch] rounded-md border-2 border-dashed border-info px-2 text-center text-info">
              ?
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Runner for the symbolic equals-sign problems (SPOV 2). Deterministic: no scale,
 * no AI - just the equation and a relational judgment. Targets the operational
 * "=" misconception with true/false judgments and non-standard fill-blanks.
 */
export function EqualSignRunner({
  step,
  onContinue,
  onAttempt,
}: {
  step: EqualSignProblemStep;
  onContinue: () => void;
  onAttempt?: (correct: boolean, mistake?: string) => void;
}) {
  const isJudge = step.interaction === "judge-equation";
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [judged, setJudged] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const solved = result?.correct ?? false;

  function check(attempt: Attempt) {
    const r = validate(step, attempt);
    setResult(r);
    if (!r.correct) setAttempts((n) => n + 1);
    onAttempt?.(r.correct, r.mistake);
  }

  function judge(value: boolean) {
    if (solved) return;
    setJudged(value);
    check({ kind: "judge", value });
  }

  function pickNumber(value: number) {
    if (solved) return;
    setPicked(value);
    check({ kind: "choice", value });
  }

  const message = result ? feedbackFor(step, result) : null;
  // Explore-first problems (SPOV 5) hold the authored hint back entirely so the
  // learner genuinely grapples; otherwise it appears after enough misses.
  const showHint =
    !solved &&
    !step.explore &&
    Boolean(step.hint) &&
    attempts >= (step.hintAfterAttempts ?? 2);

  return (
    <div className="flex flex-col gap-4">
      <AvatarCoach messages={[step.prompt]} />

      <div className="rounded-2xl border border-border bg-surface p-6">
        <EquationDisplay equation={step.equation} />
      </div>

      {isJudge ? (
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="True or false">
          {[true, false].map((value) => {
            const isPicked = judged === value;
            let tone = "border-border bg-surface2 text-ink hover:border-info";
            if (isPicked && result?.correct) tone = "border-success bg-success/15 text-success";
            else if (isPicked && result && !result.correct)
              tone = "border-warn bg-warn/15 text-warn";
            return (
              <button
                key={String(value)}
                onClick={() => judge(value)}
                disabled={solved}
                aria-pressed={isPicked}
                className={`min-h-[3.25rem] touch-manipulation rounded-xl border-2 py-4 text-lg font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-info disabled:cursor-not-allowed disabled:opacity-60 ${tone}`}
              >
                {value ? "True" : "False"}
              </button>
            );
          })}
        </div>
      ) : (
        <NumberPad
          choices={step.choices ?? []}
          picked={picked}
          correct={result ? result.correct : null}
          disabled={solved}
          onPick={pickNumber}
        />
      )}

      {message && result && (
        <FeedbackBanner correct={result.correct} message={message} />
      )}

      {showHint && (
        <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-ink">
          <span className="font-semibold text-info">Hint:</span> {step.hint}
        </div>
      )}

      {solved && (
        <Button onClick={onContinue} className="w-full">
          Continue
        </Button>
      )}
    </div>
  );
}
