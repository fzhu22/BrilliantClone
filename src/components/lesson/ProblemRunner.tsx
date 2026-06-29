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
  type TrayEntry,
} from "@/components/scale/BalanceScale";
import { equationFromScale } from "@/components/scale/scaleLogic";
import { Button } from "@/components/ui/Button";
import { NumberPad } from "@/components/ui/NumberPad";
import { FeedbackBanner } from "./FeedbackBanner";
import { AvatarCoach } from "./AvatarCoach";
import { Mascot } from "./Mascot";
import { AiHint } from "./AiHint";
import { AbstractSolve } from "./AbstractSolve";
import { isAiConfigured } from "@/lib/ai/client";
import { generateHint } from "@/lib/ai/tutor";
import {
  buildScaleProblemContext,
  buildScaleAttemptContext,
} from "@/lib/ai/context";
import type { HintResult } from "@/lib/ai/types";
import { useProgress } from "@/lib/progress";
import { scaffoldLevelFor, type ScaffoldLevel } from "@/lib/scaffold";

// One simple, middle-school-friendly instruction per interaction. Kept to a
// single bubble so Sage doesn't take long to get through.
const SAY: Record<ScaleInteraction, string> = {
  "drag-balance":
    "Drag blocks onto the empty pan until both sides match. The gray blocks can't be moved.",
  "choose-number":
    "Tap the number that keeps the scale even. If x is across from 5 blocks, then x is 5.",
  "remove-both-sides":
    "Tap a block to take it off BOTH pans at once - that keeps the scale fair. Tap an x to clear one x from each side.",
  "split-both-sides":
    "Split both sides into equal groups until one x is left. For 3x = 12, make 3 groups to get x = 4.",
  "solve-equation":
    "Tap a block to take it off both pans at once. When only equal stacks of x are left, tap Split to share them into equal groups.",
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
    tip: "Tap a block - it comes off both pans together.",
    highlight: "blocks",
    region: "scale",
  },
  "split-both-sides": {
    tip: "Use Split here to divide both sides at once.",
    highlight: "split",
    region: "scale",
  },
  "solve-equation": {
    tip: "Tap to clear matching blocks from both pans, then use Split here.",
    highlight: "split",
    region: "scale",
  },
};

const LEVEL_ORDER: ScaffoldLevel[] = ["concrete", "bridge", "abstract"];

/**
 * The highest rung a problem may fade to. Fading must never reveal the answer or
 * land on a rung with no symbolic form:
 *  - choose-number shows x beside its blocks, so its equation would give it away;
 *  - drag-balance has no variable to solve symbolically (cap at the bridge);
 *  - the symbols-only rung needs a solvable variable in the problem.
 */
function maxLevelFor(step: ScaleProblemStep): ScaffoldLevel {
  if (step.interaction === "choose-number") return "concrete";
  if (step.interaction === "drag-balance") return "bridge";
  const hasVar = [...step.initial.left, ...step.initial.right].some(
    (i) => i.kind === "var",
  );
  return hasVar ? "abstract" : "bridge";
}

function clampLevel(want: ScaffoldLevel, cap: ScaffoldLevel): ScaffoldLevel {
  return LEVEL_ORDER[
    Math.min(LEVEL_ORDER.indexOf(want), LEVEL_ORDER.indexOf(cap))
  ];
}

function capabilitiesFor(
  interaction: ScaleInteraction,
  removableVars?: boolean,
): ScaleCapabilities {
  switch (interaction) {
    case "drag-balance":
      return { drag: true, removeUnits: true };
    case "remove-both-sides":
      return { drag: true, removeUnits: true, removeVars: removableVars, paired: true };
    case "split-both-sides":
    case "solve-equation":
      return {
        drag: true,
        removeUnits: true,
        removeVars: removableVars,
        split: true,
        paired: true,
      };
    case "choose-number":
      return {};
  }
}

export function ProblemRunner({
  step,
  onContinue,
  onAttempt,
  lessonId,
  lessonTitle,
  stepIndex,
}: {
  step: ScaleProblemStep;
  onContinue: () => void;
  onAttempt?: (correct: boolean, mistake?: string) => void;
  /** Lesson/step identity, used only to give the AI tutor context. */
  lessonId?: string;
  lessonTitle?: string;
  stepIndex?: number;
}) {
  const isChoose = step.interaction === "choose-number";
  const say = SAY[step.interaction];
  const feature = FEATURES[step.interaction];
  const caps = capabilitiesFor(step.interaction, step.removableVars);

  const [state, setState] = useState(step.initial);
  const [tray, setTray] = useState<TrayEntry[]>(() =>
    (step.tray ?? []).map((item) => ({ item })),
  );
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  // After Sage finishes the intro, point to the key feature (highlight + tip).
  const [tourActive, setTourActive] = useState(false);
  // AI hint state (shown on a wrong answer).
  const [aiHint, setAiHint] = useState<HintResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [mistakes, setMistakes] = useState<string[]>([]);

  // Concreteness fading (SPOV 1): choose this problem's rung from the learner's
  // mastery of its skill, snapshotted once so the scale never vanishes mid-solve.
  const { progress } = useProgress();
  const [level] = useState<ScaffoldLevel>(() => {
    const want =
      step.scaffold && step.scaffold !== "auto"
        ? step.scaffold
        : scaffoldLevelFor(progress.skills?.[step.skill]);
    return clampLevel(want, maxLevelFor(step));
  });

  function runCheck(attempt: Attempt) {
    const r = validate(step, attempt);
    setResult(r);
    if (r.correct) {
      setSolved(true);
      setAiHint(null);
      setAiLoading(false);
    } else {
      const attemptNumber = attempts + 1;
      setAttempts(attemptNumber);
      const priorMistakes = mistakes;
      if (r.mistake) setMistakes((prev) => [...prev, r.mistake!]);
      void runAiCoach(attempt, r.mistake, attemptNumber, priorMistakes);
    }
    onAttempt?.(r.correct, r.mistake);
  }

  // Ask the AI tutor for a mistake-specific hint on a wrong answer.
  async function runAiCoach(
    attempt: Attempt,
    mistake: string | undefined,
    attemptNumber: number,
    priorMistakes: string[],
  ) {
    // Explore-first problems hold help back so the learner truly grapples (SPOV 5).
    if (!isAiConfigured || step.explore) return;
    const problemCtx = buildScaleProblemContext(
      { lessonId, lessonTitle, stepIndex },
      step,
    );
    const attemptCtx = buildScaleAttemptContext({
      step,
      attempt,
      mistake,
      attemptNumber,
      priorMistakes,
    });

    setAiLoading(true);
    const hint = await generateHint(problemCtx, attemptCtx);
    setAiLoading(false);
    if (hint) setAiHint(hint);
  }

  function onScaleChange(next: ScaleChange) {
    setState(next.state);
    setTray(next.tray);
    setResult(null); // clear stale feedback as soon as they change the scale
    setAiHint(null);
    setAiLoading(false);
  }

  function restartProblem() {
    setState(step.initial);
    setTray((step.tray ?? []).map((item) => ({ item })));
    setResult(null);
    setPicked(null);
    setSolved(false);
    setAiHint(null);
    setAiLoading(false);
    // attempts are kept so any earned hint stays available
  }

  function pickNumber(value: number) {
    if (solved) return;
    setPicked(value);
    runCheck({ kind: "choice", value });
  }

  const message = result ? feedbackFor(step, result) : null;
  const showHint =
    !solved &&
    !step.explore &&
    Boolean(step.hint) &&
    attempts >= (step.hintAfterAttempts ?? 2);

  const l = sideTotal(state.left);
  const r = sideTotal(state.right);
  const balanced = l === r;

  // Top rung: the scale has faded away and the learner solves from symbols alone.
  if (level === "abstract") {
    return (
      <AbstractSolve step={step} onContinue={onContinue} onAttempt={onAttempt} />
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
            equation={level === "bridge" ? equationFromScale(state) : undefined}
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

      {/* AI hint (Feature 1) on a wrong answer, with the authored hint as fallback */}
      {isAiConfigured && result && !result.correct && (aiLoading || aiHint) && (
        <AiHint
          loading={aiLoading}
          hint={aiHint?.hint}
          conceptTag={aiHint?.conceptTag}
          tier={aiHint?.tier}
        />
      )}
      {showHint && !aiHint && !aiLoading && (
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
