"use client";

import { useState } from "react";
import type { WorkedExampleStep } from "@/content/types";
import { BalanceScale } from "@/components/scale/BalanceScale";
import { equationFromScale } from "@/components/scale/scaleLogic";
import { Button } from "@/components/ui/Button";
import { AvatarCoach } from "./AvatarCoach";

/**
 * Renders a worked example the learner STEPS THROUGH (studies) rather than
 * solves (Sweller & Cooper, 1985). Each frame shows the scale and its equation
 * together with a one-line explanation of the move. The player fades this step
 * entirely once the skill is mastered (see LessonPlayer), so experts are never
 * held back by redundant examples.
 */
export function StepWorkedExample({
  step,
  onContinue,
}: {
  step: WorkedExampleStep;
  onContinue: () => void;
}) {
  const [i, setI] = useState(0);
  const frame = step.frames[i];
  const last = i === step.frames.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <AvatarCoach
        messages={[step.prompt, "Watch how it's solved - then you'll do the next one."]}
      />

      <BalanceScale
        state={frame.scale}
        disabled
        capabilities={{}}
        equation={equationFromScale(frame.scale)}
      />

      <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-ink">
        <span className="font-semibold text-info">
          Step {i + 1} of {step.frames.length}:
        </span>{" "}
        {frame.caption}
      </div>

      <div className="flex gap-2">
        {i > 0 && (
          <Button
            variant="secondary"
            onClick={() => setI((n) => n - 1)}
            className="shrink-0"
          >
            Back
          </Button>
        )}
        {last ? (
          <Button onClick={onContinue} className="flex-1">
            Got it
          </Button>
        ) : (
          <Button onClick={() => setI((n) => n + 1)} className="flex-1">
            Next step
          </Button>
        )}
      </div>
    </div>
  );
}
