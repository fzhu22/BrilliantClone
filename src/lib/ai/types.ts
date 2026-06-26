import type { Interaction } from "@/content/types";

/**
 * A JSON-serializable snapshot of the problem the learner is on. The `goal`
 * field may contain the answer for the model's reference only - it is never
 * rendered to the learner.
 */
export interface ProblemContext {
  lessonId: string;
  lessonTitle: string;
  stepIndex: number;
  prompt: string;
  interaction: Interaction;
  /** Plain-language goal/answer, for the model's reference only. */
  goal: string;
}

/** The salient facts about a single wrong attempt. */
export interface AttemptContext {
  /** Mistake code from the validator (e.g. "one-side-only", "slope-off"). */
  mistake?: string;
  /** Plain-language description of what the learner currently has on screen. */
  learnerState: string;
  /** 1-based count of wrong attempts so far on this problem. */
  attemptNumber: number;
  /** Mistake codes from earlier wrong attempts on this problem. */
  priorMistakes: string[];
  /** The authored fallback hint, offered to the model as a reference. */
  authoredHint?: string;
}

/** Structured result of a hint request. */
export interface HintResult {
  hint: string;
  /** Optional short concept label, e.g. "keep both sides equal". */
  conceptTag?: string;
}

/** One problem's solve history, fed to the mastery assessment. */
export interface MasteryProblem {
  prompt: string;
  interaction: Interaction;
  attempts: number;
  solvedFirstTry: boolean;
  mistakes: string[];
}

/** Everything the AI needs to judge how well a lesson was mastered. */
export interface MasterySummary {
  lessonTitle: string;
  problems: MasteryProblem[];
}

/** Structured result of the AI mastery assessment. */
export interface MasteryResult {
  /** 0-100: how much of the lesson's content the learner has mastered. */
  masteryPercent: number;
  /** Whether to award the mastery badge. */
  mastered: boolean;
  /** Short, learner-facing summary of strengths + what to review. */
  summary: string;
}
