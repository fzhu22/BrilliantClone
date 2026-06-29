"use client";

import { useState } from "react";
import type { ReflectOption, ReflectStep } from "@/content/types";
import { BalanceScale } from "@/components/scale/BalanceScale";
import { equationFromScale } from "@/components/scale/scaleLogic";
import { Button } from "@/components/ui/Button";
import { FeedbackBanner } from "./FeedbackBanner";
import { AvatarCoach } from "./AvatarCoach";

function SolutionLines({
  label,
  lines,
}: {
  label?: string;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-surface2 p-3">
      {label && (
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </div>
      )}
      <ol className="flex flex-col gap-1">
        {lines.map((line, i) => (
          <li key={i} className="font-mono text-sm text-ink">
            {line}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Renders the three error-first / self-explanation step kinds (SPOV 5) with one
 * shared multiple-choice UI. The learner studies an artifact (a buggy solve, a
 * balanced move, or two contrasting solves) and picks the explanation; each
 * option teaches through its own feedback. The "wrong answer is the curriculum."
 */
export function StepReflect({
  step,
  onContinue,
}: {
  step: ReflectStep;
  onContinue: () => void;
}) {
  const [picked, setPicked] = useState<ReflectOption | null>(null);
  const solved = picked?.correct ?? false;

  function pick(option: ReflectOption) {
    if (solved) return;
    setPicked(option);
  }

  return (
    <div className="flex flex-col gap-4">
      <AvatarCoach messages={[step.prompt]} />

      {/* Step-specific artifact to reason about. */}
      {step.type === "spot-bug" && (
        <SolutionLines label="A worked solution - one step is wrong" lines={step.lines} />
      )}

      {step.type === "self-explain" && step.scale && (
        <BalanceScale
          state={step.scale}
          disabled
          capabilities={{}}
          equation={equationFromScale(step.scale)}
        />
      )}

      {step.type === "contrast" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SolutionLines label={step.left.label} lines={step.left.lines} />
          <SolutionLines label={step.right.label} lines={step.right.lines} />
        </div>
      )}

      {/* Options */}
      <div className="flex flex-col gap-2" role="group" aria-label="Choose one">
        {step.options.map((option) => {
          const isPicked = picked?.id === option.id;
          let tone = "border-border bg-surface text-ink hover:border-info";
          if (isPicked && option.correct)
            tone = "border-success bg-success/10 text-success";
          else if (isPicked && !option.correct)
            tone = "border-warn bg-warn/10 text-warn";
          return (
            <button
              key={option.id}
              onClick={() => pick(option)}
              disabled={solved}
              aria-pressed={isPicked}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-info disabled:cursor-not-allowed ${tone}`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {picked && (
        <FeedbackBanner correct={picked.correct} message={picked.feedback} />
      )}

      {solved && (
        <Button onClick={onContinue} className="w-full">
          Continue
        </Button>
      )}
    </div>
  );
}
