import { isEqualSignStep, isGraphStep } from "./types";
import type { Item, ProblemStep } from "./types";
import type { ScaleState } from "./types";

export interface ValidationResult {
  correct: boolean;
  /** Mistake code used to look up specific feedback; undefined when correct. */
  mistake?: string;
}

/** What the learner submits, normalized per interaction. */
export type Attempt =
  | { kind: "scale"; state: ScaleState }
  | { kind: "choice"; value: number }
  | { kind: "line"; m: number; b: number }
  | { kind: "judge"; value: boolean };

export function itemWeight(item: Item): number {
  return item.kind === "unit" ? 1 : item.weight;
}

export function sideTotal(items: Item[]): number {
  return items.reduce((sum, it) => sum + itemWeight(it), 0);
}

function unitCount(items: Item[]): number {
  return items.filter((i) => i.kind === "unit").length;
}

function isSingleVar(items: Item[]): boolean {
  return items.length === 1 && items[0].kind === "var";
}

/**
 * Pure, synchronous validation. Runs in well under the 100ms feedback budget.
 */
export function validate(problem: ProblemStep, attempt: Attempt): ValidationResult {
  // Graph problems are handled first; this also narrows `problem` toward a scale
  // step for the switch below (match-line is the only graph interaction).
  if (isGraphStep(problem)) {
    if (attempt.kind !== "line") return { correct: false, mistake: "default" };
    const slopeOk = attempt.m === problem.target.m;
    const interceptOk = attempt.b === problem.target.b;
    if (slopeOk && interceptOk) return { correct: true };
    if (!slopeOk && !interceptOk) return { correct: false, mistake: "both-off" };
    return { correct: false, mistake: slopeOk ? "intercept-off" : "slope-off" };
  }

  // SPOV 2 - the symbolic equals-sign problems (judge / fill-blank).
  if (isEqualSignStep(problem)) {
    const v = problem.validator;
    if (v.kind === "equation-true") {
      if (attempt.kind !== "judge") return { correct: false, mistake: "default" };
      // A wrong call is the operational read of "=" (e.g. "8 = 5 + 3 is false").
      return attempt.value === v.isTrue
        ? { correct: true }
        : { correct: false, mistake: "operational-read" };
    }
    // fill-blank: picking the left-hand total (ignoring the rest of the right
    // side) is the operational error, so it gets its own code.
    if (attempt.kind !== "choice") return { correct: false, mistake: "default" };
    if (attempt.value === v.answer) return { correct: true };
    const operational =
      v.operational !== undefined && attempt.value === v.operational;
    return { correct: false, mistake: operational ? "operational-sum" : "wrong-number" };
  }

  const v = problem.validator;

  switch (v.kind) {
    case "choose-number": {
      if (attempt.kind !== "choice") return { correct: false, mistake: "default" };
      return attempt.value === v.answer
        ? { correct: true }
        : { correct: false, mistake: "wrong-number" };
    }

    case "sides-equal": {
      if (attempt.kind !== "scale") return { correct: false, mistake: "default" };
      const l = sideTotal(attempt.state.left);
      const r = sideTotal(attempt.state.right);
      // Both sides empty is not a real answer, just an emptied scale.
      if (l === r && l > 0) return { correct: true };
      if (l === r) return { correct: false, mistake: "empty" };
      // The learner is filling the right pan, so frame it from that side.
      return { correct: false, mistake: r < l ? "too-light" : "too-heavy" };
    }

    case "isolate-variable": {
      if (attempt.kind !== "scale") return { correct: false, mistake: "default" };
      const final = attempt.state;
      const balanced = sideTotal(final.left) === sideTotal(final.right);
      const isolated = isSingleVar(final.left) || isSingleVar(final.right);

      if (balanced && isolated) return { correct: true };

      if (!balanced) {
        // Did they change only one side? Compare unit counts to the start.
        const dl = unitCount(problem.initial.left) - unitCount(final.left);
        const dr = unitCount(problem.initial.right) - unitCount(final.right);
        const changedOnlyOneSide =
          (dl !== 0 && dr === 0) || (dr !== 0 && dl === 0);
        return {
          correct: false,
          mistake: changedOnlyOneSide ? "one-side-only" : "unbalanced",
        };
      }

      // Balanced but the variable is not alone yet.
      return { correct: false, mistake: "not-isolated" };
    }

    default:
      return { correct: false, mistake: "default" };
  }
}

/** Resolves the hand-written message to show for a result. */
export function feedbackFor(
  problem: ProblemStep,
  result: ValidationResult,
): string {
  if (result.correct) return problem.feedback.correct;
  const key = result.mistake;
  if (key && problem.feedback.byMistake?.[key]) {
    return problem.feedback.byMistake[key];
  }
  return problem.feedback.default;
}
