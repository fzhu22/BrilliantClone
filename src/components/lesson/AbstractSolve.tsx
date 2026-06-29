"use client";

import { useState } from "react";
import type { Item, ScaleProblemStep, ScaleState } from "@/content/types";
import { equationFromScale } from "@/components/scale/scaleLogic";
import { Button } from "@/components/ui/Button";
import { NumberPad } from "@/components/ui/NumberPad";
import { FeedbackBanner } from "./FeedbackBanner";
import { AvatarCoach } from "./AvatarCoach";

/** The value of x for a solve-for-x problem (every x block shares one weight). */
function solveFor(state: ScaleState): number | null {
  const v = [...state.left, ...state.right].find(
    (i): i is Extract<Item, { kind: "var" }> => i.kind === "var",
  );
  return v ? v.weight : null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Four answer options around the solution (near distractors), shuffled. */
function buildChoices(answer: number): number[] {
  const set = new Set<number>([answer]);
  for (const d of [1, -1, 2, -2, 3, -3]) {
    if (set.size >= 4) break;
    if (answer + d >= 0) set.add(answer + d);
  }
  let extra = answer + 4;
  while (set.size < 4) set.add(extra++);
  return shuffle([...set]);
}

/**
 * The "abstract" rung of concreteness fading (SPOV 1): the scale is gone and the
 * learner solves from the symbolic equation alone. Reached only once the skill is
 * mastered, so the manipulative has done its job and would now be redundant load.
 */
export function AbstractSolve({
  step,
  onContinue,
  onAttempt,
}: {
  step: ScaleProblemStep;
  onContinue: () => void;
  onAttempt?: (correct: boolean, mistake?: string) => void;
}) {
  const equation = equationFromScale(step.initial);
  const solution = solveFor(step.initial);
  const [choices] = useState<number[]>(() =>
    solution === null ? [] : buildChoices(solution),
  );
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const solved = correct === true;

  function pick(value: number) {
    if (solved || solution === null) return;
    const ok = value === solution;
    setPicked(value);
    setCorrect(ok);
    if (!ok) setAttempts((n) => n + 1);
    onAttempt?.(ok, ok ? undefined : "wrong-number");
  }

  const showHint = !solved && Boolean(step.hint) && attempts >= (step.hintAfterAttempts ?? 2);

  return (
    <div className="flex flex-col gap-4">
      <AvatarCoach
        messages={[
          step.prompt,
          "No scale this time - you've got this. Solve it from the equation.",
        ]}
      />

      <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Solve for x
        </span>
        <span className="font-mono text-3xl font-bold tracking-wide text-ink">
          {equation}
        </span>
      </div>

      <NumberPad
        choices={choices}
        picked={picked}
        correct={correct}
        disabled={solved}
        onPick={pick}
      />

      {correct !== null && (
        <FeedbackBanner
          correct={correct}
          message={
            correct
              ? step.feedback.correct
              : "Not quite - what value of x makes both sides equal?"
          }
        />
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
