"use client";

import type { ConceptStep } from "@/content/types";
import { BalanceScale } from "@/components/scale/BalanceScale";
import { Button } from "@/components/ui/Button";

export function StepConcept({
  step,
  onContinue,
}: {
  step: ConceptStep;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {step.scale && (
        <BalanceScale state={step.scale} disabled capabilities={{}} />
      )}
      <div className="rounded-2xl border border-info/30 bg-info/5 p-5">
        {step.title && (
          <h2 className="text-lg font-bold text-info">{step.title}</h2>
        )}
        <p className="mt-2 text-pretty text-ink">{step.body}</p>
      </div>
      <Button onClick={onContinue} className="w-full">
        Got it
      </Button>
    </div>
  );
}
