"use client";

import { useState } from "react";
import type { ScaleInteraction, ScaleProblemStep } from "@/content/types";
import {
  validate,
  feedbackFor,
  sideTotal,
  type Attempt,
  type ValidationResult,
} from "@/content/validators";
import {
  BalanceScale,
  type ScaleCapabilities,
  type ScaleChange,
} from "@/components/scale/BalanceScale";
import { Button } from "@/components/ui/Button";
import { NumberPad } from "@/components/ui/NumberPad";
import { FeedbackBanner } from "./FeedbackBanner";
import { AvatarCoach } from "./AvatarCoach";
import { Mascot } from "./Mascot";

// One simple, middle-school-friendly instruction per interaction. Kept to a
// single bubble so Sage doesn't take long to get through.
const SAY: Record<ScaleInteraction, string> = {
  "drag-balance":
    "Drag blocks onto the empty pan until both sides match. The gray blocks can't be moved.",
  "choose-number":
    "Tap the number that keeps the scale even. If x is across from 5 blocks, then x is 5.",
  "remove-both-sides":
    "Take the same blocks off both sides until x is alone. You can take an x off each side too - just keep it fair.",
  "split-both-sides":
    "Split both sides into equal groups until one x is left. For 3x = 12, make 3 groups to get x = 4.",
  "solve-equation":
    "First take the extra blocks off both sides, then split into equal groups. For 2x + 1 = 7, take 1 off each side, then make 2 groups.",
};

// Which on-screen feature Sage points to (and highlights) for each interaction.
const FEATURES: Record<
  ScaleInteraction,
  { tip: string; highlight?: "tray" | "split" | "blocks"; region: "scale" | "numbers" }
> = {
  "drag-balance": {
    tip: "Drag blocks from here onto the empty pan.",
    highlight: "tray",
    region: "scale",
  },
  "choose-number": { tip: "Tap your answer below.", region: "numbers" },
  "remove-both-sides": {
    tip: "Tap blocks right on the scale - take the same off both sides.",
    highlight: "blocks",
    region: "scale",
  },
  "split-both-sides": {
    tip: "Use Split here to divide both sides at once.",
    highlight: "split",
    region: "scale",
  },
  "solve-equation": {
    tip: "Clear extra blocks, then use Split here.",
    highlight: "split",
    region: "scale",
  },
};

function capabilitiesFor(
  interaction: ScaleInteraction,
  removableVars?: boolean,
): ScaleCapabilities {
  switch (interaction) {
    case "drag-balance":
    case "remove-both-sides":
      return { drag: true, removeUnits: true, removeVars: removableVars };
    case "split-both-sides":
    case "solve-equation":
      return { drag: true, removeUnits: true, removeVars: removableVars, split: true };
    case "choose-number":
      return {};
  }
}

export function ProblemRunner({
  step,
  onContinue,
  onAttempt,
}: {
  step: ScaleProblemStep;
  onContinue: () => void;
  onAttempt?: (correct: boolean, mistake?: string) => void;
}) {
  const isChoose = step.interaction === "choose-number";
  const say = SAY[step.interaction];
  const feature = FEATURES[step.interaction];
  const caps = capabilitiesFor(step.interaction, step.removableVars);

  const [state, setState] = useState(step.initial);
  const [tray, setTray] = useState(step.tray ?? []);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [inEasier, setInEasier] = useState(false);
  // After Sage finishes the intro, point to the key feature (highlight + tip).
  const [tourActive, setTourActive] = useState(false);

  function runCheck(attempt: Attempt) {
    const r = validate(step, attempt);
    setResult(r);
    if (r.correct) setSolved(true);
    else setAttempts((a) => a + 1);
    onAttempt?.(r.correct, r.mistake);
  }

  function onScaleChange(next: ScaleChange) {
    setState(next.state);
    setTray(next.tray);
    setResult(null); // clear stale feedback as soon as they change the scale
  }

  function restartProblem() {
    setState(step.initial);
    setTray(step.tray ?? []);
    setResult(null);
    setPicked(null);
    setSolved(false);
    // attempts are kept so any earned hint stays available
  }

  function pickNumber(value: number) {
    if (solved) return;
    setPicked(value);
    runCheck({ kind: "choice", value });
  }

  const message = result ? feedbackFor(step, result) : null;
  const showHint =
    !solved && Boolean(step.hint) && attempts >= (step.hintAfterAttempts ?? 2);
  const showEasierOffer =
    !solved &&
    Boolean(step.easier) &&
    attempts >= (step.easierAfterAttempts ?? 2);

  const l = sideTotal(state.left);
  const r = sideTotal(state.right);
  const balanced = l === r;

  // Detour: a simpler authored sub-problem to scaffold a stuck learner. It does
  // not report attempts (no onAttempt), so it never affects mastery or points.
  if (inEasier && step.easier) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-ink">
          <span className="font-semibold text-info">Warm-up.</span> Try this simpler
          version first, then we&apos;ll head back to the problem.
        </div>
        <ProblemRunner
          step={step.easier}
          onContinue={() => {
            setInEasier(false);
            restartProblem();
          }}
        />
        <button
          type="button"
          onClick={() => setInEasier(false)}
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          Back to the problem
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sage teaches the problem in two short bubbles: the task, then how. */}
      <AvatarCoach
        messages={[step.prompt, say]}
        onComplete={() => setTourActive(true)}
      />

      {/* Once Sage finishes, it "moves" to the feature: a tip + a highlight. */}
      {tourActive && !solved && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/5 px-3 py-2 text-sm">
          <span className="shrink-0">
            <Mascot size={34} speaking />
          </span>
          <span className="text-ink">{feature.tip}</span>
        </div>
      )}

      {/* Interaction */}
      {isChoose ? (
        <>
          {(state.left.length > 0 || state.right.length > 0) && (
            <BalanceScale state={state} capabilities={{}} disabled />
          )}
          <NumberPad
            choices={step.choices ?? []}
            picked={picked}
            correct={result ? result.correct : null}
            disabled={solved}
            highlight={tourActive && feature.region === "numbers" && !solved}
            onPick={pickNumber}
          />
        </>
      ) : (
        <>
          <BalanceScale
            state={state}
            tray={tray}
            capabilities={caps}
            onChange={onScaleChange}
            disabled={solved}
            highlight={tourActive && !solved ? feature.highlight : undefined}
          />
          {/* Live status so the goal is always observable */}
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-muted">
              Left <span className="font-bold text-ink">{l}</span>
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                balanced ? "bg-success/15 text-success" : "bg-warn/15 text-warn"
              }`}
            >
              {balanced ? "Level" : "Not level"}
            </span>
            <span className="text-muted">
              Right <span className="font-bold text-ink">{r}</span>
            </span>
          </div>
        </>
      )}

      {/* Feedback */}
      {message && result && (
        <FeedbackBanner correct={result.correct} message={message} />
      )}

      {/* Hint after repeated misses */}
      {showHint && (
        <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-ink">
          <span className="font-semibold text-info">Hint:</span> {step.hint}
        </div>
      )}

      {/* Offer an easier scaffolded step when the learner is stuck */}
      {showEasierOffer && (
        <button
          type="button"
          onClick={() => setInEasier(true)}
          className="rounded-xl border border-info/40 bg-info/10 px-4 py-2.5 text-sm font-semibold text-info transition-colors hover:bg-info/20"
        >
          Stuck? Try an easier version &rarr;
        </button>
      )}

      {/* Actions */}
      {solved ? (
        <Button onClick={onContinue} className="w-full">
          Continue
        </Button>
      ) : isChoose ? null : (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={restartProblem}
            className="shrink-0"
            aria-label="Restart this problem"
          >
            Restart
          </Button>
          <Button onClick={() => runCheck({ kind: "scale", state })} className="flex-1">
            Check
          </Button>
        </div>
      )}
    </div>
  );
}
