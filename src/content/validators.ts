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
  | { kind: "choice"; value: number };

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
