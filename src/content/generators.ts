// Deterministic problem generators - one per skill. Each returns a fully-formed
// problem with randomized but SMALL, integer-solution numbers, so review never
// repeats the exact same item (varied practice; Schmidt & Bjork, 1992) while
// staying correctly leveled. This is NOT AI generation: solutions are integer by
// construction (checked by the same validators the lessons use) and feedback is
// keyed to the same misconception codes, so generated variants are never
// confidently wrong, misconception-blind, or mis-leveled.

import type {
  EqualSignProblemStep,
  Feedback,
  GraphProblemStep,
  Item,
  ProblemStep,
  ScaleProblemStep,
  SkillId,
} from "./types";

// --- small helpers -------------------------------------------------------

function randInt(lo: number, hi: number): number {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const units = (n: number): Item[] =>
  Array.from({ length: n }, () => ({ kind: "unit" as const }));
const lockedUnits = (n: number): Item[] =>
  Array.from({ length: n }, () => ({ kind: "unit" as const, locked: true }));
const xs = (n: number, weight: number): Item[] =>
  Array.from({ length: n }, () => ({ kind: "var" as const, label: "x", weight }));
const xVar = (weight: number): Item => ({ kind: "var", label: "x", weight });

/** Four answer options including `answer`, with near distractors, shuffled. */
function numberChoices(answer: number): number[] {
  const set = new Set<number>([answer]);
  for (const delta of [-2, -1, 1, 2, 3]) {
    if (set.size >= 4) break;
    const c = answer + delta;
    if (c >= 1) set.add(c);
  }
  let extra = answer + 4;
  while (set.size < 4) set.add(extra++);
  return shuffle([...set]);
}

// --- shared, number-agnostic feedback (keyed to validator mistake codes) --

const EQUALITY_FEEDBACK: Feedback = {
  correct: "Level! Both pans weigh the same - that is what = means.",
  byMistake: {
    "too-light": "The right side is still up - add another block.",
    "too-heavy": "The right side dropped - take one off.",
    empty: "Drag some blocks onto the right pan to get started.",
  },
  default: "Not level yet - match the left pan.",
};

const READ_VARIABLE_FEEDBACK: Feedback = {
  correct: "Yes! x balances the blocks on the other pan.",
  byMistake: {
    "wrong-number": "Count the blocks on the right pan - that is what x weighs.",
  },
  default: "How many blocks does x balance?",
};

const ISOLATE_FEEDBACK: Feedback = {
  correct: "Still level - you got x alone! Same idea every time: keep both sides equal.",
  byMistake: {
    "one-side-only": "The scale tipped - do the same thing to both sides.",
    unbalanced: "Not level - mirror every move on both sides.",
    "not-isolated": "Keep going - x is not alone yet.",
  },
  default: "Take blocks off both sides (then split) until x is by itself.",
};

const EQUAL_SIGN_FEEDBACK: Feedback = {
  correct: "Right - the equals sign means both sides are the SAME amount.",
  byMistake: {
    "operational-read":
      "The = sign doesn't mean 'the answer comes next'. It means both sides are equal. Add up each side and compare.",
    "operational-sum":
      "That's just the left side's total. Both sides have to match, so account for the rest of the right side too.",
    "wrong-number": "Make both sides add up to the same total.",
  },
  default: "Make both sides equal - that is what = means.",
};

const MATCH_LINE_FEEDBACK: Feedback = {
  correct: "Matched it - the slope and the crossing point both line up!",
  byMistake: {
    "intercept-off": "The slope looks right - now slide b to the right crossing point.",
    "slope-off": "The crossing point is right - now change m so the tilt matches.",
    "both-off": "Start with b: where does the dashed line cross the y-axis?",
  },
  default: "Adjust the sliders until your line sits on the dashed one.",
};

// --- per-skill generators ------------------------------------------------

/** Four blank options around the answer, always including the operational trap. */
function blankChoices(answer: number, operational: number): number[] {
  const set = new Set<number>([answer, operational]);
  for (const delta of [1, -1, 2, -2]) {
    if (set.size >= 4) break;
    const c = answer + delta;
    if (c >= 1 && c !== operational) set.add(c);
  }
  let extra = answer + 3;
  while (set.size < 4) set.add(extra++);
  return shuffle([...set]);
}

/**
 * SPOV 2 - non-standard equals-sign items. Alternates true/false judgments
 * (including the "answer on the left" form `8 = 5 + 3`) and right-blank
 * fill-ins where the operational total is always an option, so the relational
 * read is what's actually tested.
 */
function equalSign(): EqualSignProblemStep {
  if (Math.random() < 0.5) {
    const a = randInt(1, 6);
    const b = randInt(1, 6);
    const sum = a + b;
    const makeTrue = Math.random() < 0.5;
    const c = randInt(1, sum - 1);
    const d = makeTrue ? sum - c : sum - c + pick([1, 2]);
    // Half the time, flip to the "answer first" form: total = c + d.
    const flipped = Math.random() < 0.4;
    const equation = flipped ? `${sum} = ${c} + ${d}` : `${a} + ${b} = ${c} + ${d}`;
    return {
      type: "problem",
      skill: "equal-sign",
      interaction: "judge-equation",
      prompt: "True or false? Check both sides.",
      equation,
      validator: { kind: "equation-true", isTrue: c + d === sum },
      feedback: EQUAL_SIGN_FEEDBACK,
      hint: "Add up the left side, then the right side. Equal totals means true.",
    };
  }
  const a = randInt(2, 6);
  const b = randInt(2, 6);
  const sum = a + b;
  const e = randInt(1, sum - 1);
  const answer = sum - e;
  return {
    type: "problem",
    skill: "equal-sign",
    interaction: "fill-blank",
    prompt: "Fill the blank so both sides are equal.",
    equation: `${a} + ${b} = ? + ${e}`,
    choices: blankChoices(answer, sum),
    validator: { kind: "fill-blank", answer, operational: sum },
    feedback: EQUAL_SIGN_FEEDBACK,
    hint: `Both sides must total ${sum}, so ? + ${e} = ${sum}.`,
  };
}

function equality(): ScaleProblemStep {
  const n = randInt(2, 6);
  return {
    type: "problem",
    skill: "equality",
    interaction: "drag-balance",
    prompt: "Drag blocks onto the right pan until the scale is level.",
    initial: { left: lockedUnits(n), right: [] },
    tray: units(Math.max(n + 2, 6)),
    validator: { kind: "sides-equal" },
    feedback: EQUALITY_FEEDBACK,
    hint: `The left pan has ${n} fixed blocks, so put ${n} on the right.`,
  };
}

function readVariable(): ScaleProblemStep {
  const w = randInt(2, 9);
  return {
    type: "problem",
    skill: "read-variable",
    interaction: "choose-number",
    prompt: "The scale is balanced. What does x weigh?",
    initial: { left: [xVar(w)], right: units(w) },
    choices: numberChoices(w),
    validator: { kind: "choose-number", answer: w },
    feedback: READ_VARIABLE_FEEDBACK,
  };
}

function oneStep(): ScaleProblemStep {
  const v = randInt(1, 8); // value of x
  const e = randInt(1, 5); // extra single blocks sitting with x
  return {
    type: "problem",
    skill: "one-step",
    interaction: "remove-both-sides",
    prompt: "Solve for x. Get it alone while keeping the scale level.",
    initial: { left: [xVar(v), ...units(e)], right: units(v + e) },
    validator: { kind: "isolate-variable" },
    feedback: ISOLATE_FEEDBACK,
    hint: `There are ${e} extra blocks with x. Take ${e} off each side.`,
  };
}

function twoStep(): ScaleProblemStep {
  const a = randInt(2, 4); // number of x's
  const v = randInt(2, 5); // value of x
  const b = randInt(1, 4); // extra units
  const total = a * v + b;
  return {
    type: "problem",
    skill: "two-step",
    interaction: "solve-equation",
    prompt: `Solve ${a}x + ${b} = ${total}. You will need both moves.`,
    initial: { left: [...xs(a, v), ...units(b)], right: units(total) },
    validator: { kind: "isolate-variable" },
    feedback: ISOLATE_FEEDBACK,
    hint: `Step 1: take ${b} off each side. Step 2: split both sides into ${a} groups.`,
  };
}

function varsBothSides(): ScaleProblemStep {
  const v = randInt(2, 5); // value of x
  const c = randInt(1, 2); // x's on the right
  const a = c + randInt(1, 2); // more x's on the left
  const b = randInt(1, 3); // units on the left
  const d = (a - c) * v + b; // units on the right (keeps it balanced)
  return {
    type: "problem",
    skill: "vars-both-sides",
    interaction: "solve-equation",
    removableVars: true,
    prompt: `Solve ${a}x + ${b} = ${c}x + ${d}.`,
    initial: { left: [...xs(a, v), ...units(b)], right: [...xs(c, v), ...units(d)] },
    validator: { kind: "isolate-variable" },
    feedback: ISOLATE_FEEDBACK,
    hint: `Take ${c} x off both sides first, then clear the single blocks and split.`,
  };
}

function graphLine(): GraphProblemStep {
  const m = pick([-3, -2, -1, 1, 2, 3]); // a real tilt (slope handles flat/fractions)
  const b = randInt(-5, 5);
  return {
    type: "problem",
    skill: "graph-line",
    interaction: "match-line",
    prompt: "Match the dashed line.",
    target: { m, b },
    mRange: [-3, 3],
    bRange: [-5, 5],
    validator: { kind: "match-line" },
    feedback: MATCH_LINE_FEEDBACK,
    hint: `It crosses the y-axis at ${b}, so b = ${b}. Its slope is ${m}.`,
  };
}

function slope(): GraphProblemStep {
  // Mix flat (0), fractional halves, and steeper negative/positive slopes.
  const m = Math.random() < 0.4 ? pick([-1.5, -0.5, 0.5, 1.5]) : pick([-3, -2, 0, 2, 3]);
  const b = randInt(-5, 5);
  return {
    type: "problem",
    skill: "slope",
    interaction: "match-line",
    prompt: "Match the dashed line by setting its slope and intercept.",
    target: { m, b },
    mRange: [-3, 3],
    bRange: [-5, 5],
    mStep: 0.5,
    validator: { kind: "match-line" },
    feedback: MATCH_LINE_FEEDBACK,
    hint: `b = ${b}. The slope (rise over run) is ${m}.`,
  };
}

/** Generates a fresh, validator-correct problem variant for a skill. */
export function generateProblem(skill: SkillId): ProblemStep {
  switch (skill) {
    case "equal-sign":
      return equalSign();
    case "equality":
      return equality();
    case "read-variable":
      return readVariable();
    case "one-step":
      return oneStep();
    case "two-step":
      return twoStep();
    case "vars-both-sides":
      return varsBothSides();
    case "graph-line":
      return graphLine();
    case "slope":
      return slope();
  }
}
