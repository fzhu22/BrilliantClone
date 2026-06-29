import type { Lesson } from "../types";

const units = (n: number) =>
  Array.from({ length: n }, () => ({ kind: "unit" as const }));

// Lesson 1 - "Balance and the variable."
// Quick intro to = and x, then straight into one-step solving so it does not
// drag for an 11-14 year old. Numbers are kept small on purpose: the challenge
// is the idea (keep both sides equal), not the number of blocks to click.
export const lesson1: Lesson = {
  id: "level-means-equal",
  title: "Balance and the variable",
  tag: "Start",
  subtitle: "Equations are balances",
  steps: [
    // Explore-first pretest (SPOV 5): solvable by reasoning before any teaching,
    // so the learner generates an approach first. Hints are held back here.
    {
      type: "problem",
      skill: "equality",
      explore: true,
      prompt: "Before we explain anything - drag blocks onto the right pan until the scale is level.",
      interaction: "drag-balance",
      initial: {
        left: [
          { kind: "unit", locked: true },
          { kind: "unit", locked: true },
          { kind: "unit", locked: true },
        ],
        right: [],
      },
      tray: units(5),
      validator: { kind: "sides-equal" },
      feedback: {
        correct:
          "Level! Both sides weigh 3. A balanced scale means the two sides are equal - that is what = means!",
        byMistake: {
          "too-light": "The right side is still up - add another block.",
          "too-heavy": "The right side dropped - take one off.",
          empty: "Drag some blocks onto the right pan to get started.",
        },
        default: "Not level yet - match the left pan.",
      },
      hint: "The left pan has 3 fixed blocks, so put 3 on the right.",
    },
    {
      type: "concept",
      title: "A balanced scale is an equation.",
      body:
        "When the scale is level, both sides weigh the same. A letter like x just stands for an unknown weight.",
    },
    // Read the variable off a balanced scale.
    {
      type: "problem",
      skill: "read-variable",
      prompt: "The scale is balanced. What does x weigh?",
      interaction: "choose-number",
      initial: { left: [{ kind: "var", label: "x", weight: 4 }], right: units(4) },
      choices: [3, 4, 5, 7],
      validator: { kind: "choose-number", answer: 4 },
      feedback: {
        correct: "Yes! x balances 4 blocks, so x = 4!",
        byMistake: {
          "wrong-number": "Count the blocks on the right pan - that is what x weighs.",
        },
        default: "How many blocks does x balance?",
      },
    },
    {
      type: "concept",
      title: "Keep both sides equal.",
      body:
        "To find x, get it alone. Whatever you take off one side, take off the other so the scale stays level.",
    },
    // One-step solve.
    {
      type: "problem",
      skill: "one-step",
      prompt: "Solve for x. Get it alone while keeping the scale level.",
      interaction: "remove-both-sides",
      initial: {
        left: [{ kind: "var", label: "x", weight: 3 }, ...units(2)],
        right: units(5),
      },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct: "Still level - x = 3! You took 2 off each side.",
        byMistake: {
          "one-side-only":
            "The scale tipped - take the same number of blocks off both sides.",
          unbalanced: "Not level - change both sides the same way.",
          "not-isolated": "Keep going - x is not alone yet.",
        },
        default: "Take blocks off both sides until x is alone.",
      },
      hint: "There are 2 extra blocks with x. Take 2 off each side.",
    },
    // Self-explanation (SPOV 5): name the principle behind the move just made.
    {
      type: "self-explain",
      skill: "one-step",
      prompt: "You took 2 blocks off each side and x came out to 3. Why did the scale stay level?",
      scale: { left: [{ kind: "var", label: "x", weight: 3 }], right: units(3) },
      options: [
        {
          id: "same",
          text: "Because I removed the same amount from both sides.",
          correct: true,
          feedback:
            "Exactly. Doing the same thing to both sides keeps them equal - that's the one rule behind every step.",
        },
        {
          id: "heavier",
          text: "Because the left side was heavier to start with.",
          correct: false,
          feedback:
            "Not quite - the sides were equal the whole time. It stayed level because both sides changed the same way.",
        },
        {
          id: "always",
          text: "Because x is always 3.",
          correct: false,
          feedback:
            "x isn't always 3 - that's just this problem. The balance held because both sides changed equally.",
        },
      ],
    },
    // One more, slightly bigger.
    {
      type: "problem",
      skill: "one-step",
      prompt: "Last one. Solve for x.",
      interaction: "remove-both-sides",
      initial: {
        left: [{ kind: "var", label: "x", weight: 4 }, ...units(3)],
        right: units(7),
      },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct: "Nice work - x = 4! Same move every time: keep both sides equal.",
        byMistake: {
          "one-side-only": "One side tipped - take the same off both pans.",
          unbalanced: "Keep it level - mirror every move on both sides.",
          "not-isolated": "Almost - x still has extra blocks with it.",
        },
        default: "Take the extra blocks off both sides.",
      },
    },
  ],
};
