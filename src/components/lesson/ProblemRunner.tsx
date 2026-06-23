"use client";

import { useState } from "react";
import type { Interaction, ProblemStep } from "@/content/types";
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

// Clear, hand-written guidance per interaction: how to act, the goal, and a
// concrete worked example so the objective is never ambiguous.
const GUIDES: Record<Interaction, { how: string; goal: string; example: string }> = {
  "drag-balance": {
    how: "Drag blocks from the tray onto the empty pan. Tap a block you added to take it off. The gray blocks are fixed - you can't move them.",
    goal: "Make the scale level - both sides weigh the same.",
    example:
      "Example: the left pan has 3 fixed blocks, so drag 3 blocks onto the right pan to balance it.",
  },
  "choose-number": {
    how: "Tap the number you think is correct.",
    goal: "Pick the weight that keeps the scale balanced.",
    example:
      "Example: if x sits opposite 5 blocks on a level scale, then x weighs 5.",
  },
  "remove-both-sides": {
    how: "Tap a block to remove it (it goes to the tray - drag it back anytime). Whatever you do to one side, do to the other.",
    goal: "Get the mystery block x alone on its side, keeping the scale level.",
    example:
      "Example: for x + 2 = 6, take 2 blocks off each side. That leaves x = 4.",
  },
  "split-both-sides": {
    how: "Choose how many equal groups, then tap Split - it divides both sides at once. You can also tap or drag unit blocks.",
    goal: "Get one mystery block alone, keeping the scale level.",
    example:
      "Example: for 3x = 12, split both sides into 3 groups. One x then balances 4.",
  },
  "solve-equation": {
    how: "Use both moves: tap to remove blocks from both sides, and Split into equal groups. Removed blocks go to the tray.",
    goal: "Get one x alone and the scale level.",
    example:
      "Example: for 2x + 1 = 7, first remove 1 block from each side (2x = 6), then split both sides into 2 groups (x = 3).",
  },
};

function capabilitiesFor(interaction: Interaction): ScaleCapabilities {
  switch (interaction) {
    case "drag-balance":
    case "remove-both-sides":
      return { drag: true, removeUnits: true };
    case "split-both-sides":
    case "solve-equation":
      return { drag: true, removeUnits: true, split: true };
    case "choose-number":
      return {};
  }
}

export function ProblemRunner({
  step,
  onContinue,
  onAttempt,
}: {
  step: ProblemStep;
  onContinue: () => void;
  onAttempt?: (correct: boolean, mistake?: string) => void;
}) {
  const isChoose = step.interaction === "choose-number";
  const guide = GUIDES[step.interaction];
  const caps = capabilitiesFor(step.interaction);

  const [state, setState] = useState(step.initial);
  const [tray, setTray] = useState(step.tray ?? []);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [showExample, setShowExample] = useState(false);

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

  const l = sideTotal(state.left);
  const r = sideTotal(state.right);
  const balanced = l === r;

  return (
    <div className="flex flex-col gap-4">
      {/* Prompt */}
      <h2 className="text-balance text-xl font-bold">{step.prompt}</h2>

      {/* Clear how-to + goal */}
      <div className="rounded-xl border border-border bg-surface p-3 text-sm">
        <p className="text-muted">
          <span className="font-semibold text-ink">How:</span> {guide.how}
        </p>
        <p className="mt-1.5 text-muted">
          <span className="font-semibold text-brand">Goal:</span> {guide.goal}
        </p>
        <button
          type="button"
          onClick={() => setShowExample((s) => !s)}
          className="mt-2 text-xs font-semibold text-info hover:underline"
          aria-expanded={showExample}
        >
          {showExample ? "Hide example" : "Show an example"}
        </button>
        {showExample && (
          <p className="mt-1.5 rounded-lg bg-surface2 p-2 text-xs text-ink">
            {guide.example}
          </p>
        )}
      </div>

      {/* Interaction */}
      {isChoose ? (
        <>
          <BalanceScale state={state} capabilities={{}} disabled />
          <NumberPad
            choices={step.choices ?? []}
            picked={picked}
            correct={result ? result.correct : null}
            disabled={solved}
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
