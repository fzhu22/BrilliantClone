"use client";

import type { ConceptStep } from "@/content/types";
import { BalanceScale } from "@/components/scale/BalanceScale";
import { Button } from "@/components/ui/Button";
import { AvatarCoach } from "./AvatarCoach";

export function StepConcept({
  step,
  onContinue,
}: {
  step: ConceptStep;
  onContinue: () => void;
}) {
  // Keep it to at most two bubbles (title, then the idea) so it reads quickly.
  const messages = [step.title, step.body].filter(
    (m): m is string => Boolean(m && m.trim()),
  );

  return (
    <div className="flex flex-col gap-5">
      {step.scale && (
        <BalanceScale state={step.scale} disabled capabilities={{}} />
      )}
      <AvatarCoach messages={messages} />
      <Button onClick={onContinue} className="w-full">
        Got it
      </Button>
    </div>
  );
}
