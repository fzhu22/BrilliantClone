// Serializers that turn the live problem + attempt into compact, plain-language
// context for the tutor model. Kept pure (no React, no Firebase) so it is easy
// to test and reuse.

import type {
  GraphProblemStep,
  Item,
  ScaleProblemStep,
  ScaleState,
} from "@/content/types";
import { sideTotal, type Attempt } from "@/content/validators";
import type { AttemptContext, ProblemContext } from "./types";

interface Meta {
  lessonId?: string;
  lessonTitle?: string;
  stepIndex?: number;
}

function describeSide(items: Item[]): string {
  const units = items.filter((i) => i.kind === "unit").length;
  const byLabel = new Map<string, number>();
  for (const it of items) {
    if (it.kind === "var") byLabel.set(it.label, (byLabel.get(it.label) ?? 0) + 1);
  }
  const parts: string[] = [];
  for (const [label, n] of byLabel) {
    parts.push(`${n} ${label}-block${n > 1 ? "s" : ""}`);
  }
  if (units) parts.push(`${units} single block${units > 1 ? "s" : ""}`);
  return parts.length ? parts.join(" and ") : "empty";
}

function describeScale(state: ScaleState): string {
  return (
    `Left pan: ${describeSide(state.left)} (weight ${sideTotal(state.left)}). ` +
    `Right pan: ${describeSide(state.right)} (weight ${sideTotal(state.right)}).`
  );
}

/** First variable found on either pan, used to state the solution value. */
function firstVar(state: ScaleState): Extract<Item, { kind: "var" }> | null {
  for (const side of [state.left, state.right]) {
    for (const it of side) if (it.kind === "var") return it;
  }
  return null;
}

function scaleGoal(step: ScaleProblemStep): string {
  switch (step.validator.kind) {
    case "sides-equal":
      return `Both pans must end up the same weight; the fixed side weighs ${sideTotal(
        step.initial.left,
      )}.`;
    case "choose-number":
      return `The correct choice is ${step.validator.answer}.`;
    case "isolate-variable": {
      const v = firstVar(step.initial);
      return v
        ? `Isolate the variable. ${v.label} weighs ${v.weight}, so the answer is ${v.label} = ${v.weight}.`
        : "Isolate the variable to find its value.";
    }
    default:
      return "Solve the problem.";
  }
}

export function buildScaleProblemContext(
  meta: Meta,
  step: ScaleProblemStep,
): ProblemContext {
  return {
    lessonId: meta.lessonId ?? "",
    lessonTitle: meta.lessonTitle ?? "",
    stepIndex: meta.stepIndex ?? 0,
    prompt: step.prompt,
    interaction: step.interaction,
    goal: scaleGoal(step),
  };
}

export function buildScaleAttemptContext(args: {
  step: ScaleProblemStep;
  attempt: Attempt;
  mistake?: string;
  attemptNumber: number;
  priorMistakes: string[];
}): AttemptContext {
  const { step, attempt, mistake, attemptNumber, priorMistakes } = args;
  let learnerState = "Unknown.";
  if (attempt.kind === "scale") learnerState = describeScale(attempt.state);
  else if (attempt.kind === "choice") learnerState = `The learner chose ${attempt.value}.`;
  return {
    mistake,
    learnerState,
    attemptNumber,
    priorMistakes,
    authoredHint: step.hint,
  };
}

export function buildGraphProblemContext(
  meta: Meta,
  step: GraphProblemStep,
): ProblemContext {
  return {
    lessonId: meta.lessonId ?? "",
    lessonTitle: meta.lessonTitle ?? "",
    stepIndex: meta.stepIndex ?? 0,
    prompt: step.prompt,
    interaction: step.interaction,
    goal: `Target line y = ${step.target.m}x + ${step.target.b} (slope ${step.target.m}, y-intercept ${step.target.b}).`,
  };
}

export function buildGraphAttemptContext(args: {
  step: GraphProblemStep;
  m: number;
  b: number;
  mistake?: string;
  attemptNumber: number;
  priorMistakes: string[];
}): AttemptContext {
  const { step, m, b, mistake, attemptNumber, priorMistakes } = args;
  return {
    mistake,
    learnerState: `The learner's line is y = ${m}x + ${b} (slope ${m}, y-intercept ${b}).`,
    attemptNumber,
    priorMistakes,
    authoredHint: step.hint,
  };
}
