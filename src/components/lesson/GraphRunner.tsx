"use client";

import { useState } from "react";
import type { GraphProblemStep } from "@/content/types";
import { validate, feedbackFor, type ValidationResult } from "@/content/validators";
import { CoordinateGrid } from "@/components/graph/CoordinateGrid";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { FeedbackBanner } from "./FeedbackBanner";
import { AvatarCoach } from "./AvatarCoach";

const SAY =
  "Drag the two sliders to match the dashed line. m tilts the line (slope) and b slides it up or down (the y-intercept).";

function clamp(v: number, [lo, hi]: [number, number]) {
  return Math.max(lo, Math.min(hi, v));
}

/** Renders "y = mx + b" with tidy signs. */
function equationText(m: number, b: number): string {
  const bPart = b < 0 ? `- ${Math.abs(b)}` : `+ ${b}`;
  return `y = ${m}x ${bPart}`;
}

export function GraphRunner({
  step,
  onContinue,
  onAttempt,
}: {
  step: GraphProblemStep;
  onContinue: () => void;
  onAttempt?: (correct: boolean, mistake?: string) => void;
}) {
  const range = Math.max(Math.abs(step.bRange[0]), step.bRange[1], 6);
  const mStep = step.mStep ?? step.sliderStep ?? 1;
  const bStep = step.bStep ?? step.sliderStep ?? 1;

  const [m, setM] = useState(() => clamp(1, step.mRange));
  const [b, setB] = useState(() => clamp(0, step.bRange));
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [solved, setSolved] = useState(false);
  const [tourActive, setTourActive] = useState(false);

  function check() {
    const r = validate(step, { kind: "line", m, b });
    setResult(r);
    if (r.correct) setSolved(true);
    onAttempt?.(r.correct, r.mistake);
  }

  function change(setter: (n: number) => void, value: number) {
    if (solved) return;
    setter(value);
    setResult(null);
  }

  const message = result ? feedbackFor(step, result) : null;
  const showHint = !solved && Boolean(step.hint) && result !== null && !result.correct;

  return (
    <div className="flex flex-col gap-4">
      <AvatarCoach
        messages={[step.prompt, SAY]}
        onComplete={() => setTourActive(true)}
      />

      <CoordinateGrid range={range} m={m} b={b} target={step.target} />

      <div className="text-center text-lg font-bold text-brand">
        {equationText(m, b)}
      </div>

      {/* sliders */}
      <div
        className={`flex flex-col gap-4 rounded-2xl border bg-surface p-4 ${
          tourActive && !solved ? "feature-highlight" : "border-border"
        }`}
      >
        <div className="flex flex-col gap-1">
          <span className="flex justify-between text-sm">
            <span className="text-muted">Slope (m)</span>
            <span className="font-bold text-ink">{m}</span>
          </span>
          <Slider
            min={step.mRange[0]}
            max={step.mRange[1]}
            step={mStep}
            value={m}
            disabled={solved}
            onChange={(v) => change(setM, v)}
            ariaLabel="Slope m"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex justify-between text-sm">
            <span className="text-muted">Intercept (b)</span>
            <span className="font-bold text-ink">{b}</span>
          </span>
          <Slider
            min={step.bRange[0]}
            max={step.bRange[1]}
            step={bStep}
            value={b}
            disabled={solved}
            onChange={(v) => change(setB, v)}
            ariaLabel="Intercept b"
          />
        </div>
      </div>

      {message && result && (
        <FeedbackBanner correct={result.correct} message={message} />
      )}

      {showHint && (
        <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-ink">
          <span className="font-semibold text-info">Hint:</span> {step.hint}
        </div>
      )}

      {solved ? (
        <Button onClick={onContinue} className="w-full">
          Continue
        </Button>
      ) : (
        <Button onClick={check} className="w-full">
          Check
        </Button>
      )}
    </div>
  );
}
