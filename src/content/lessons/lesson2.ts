import type { Lesson } from "../types";

// Lesson 2 - "Keep both sides equal."
// Small concept: to keep a scale level, do the same thing to both sides. This
// is the one move that solves equations.
export const lesson2: Lesson = {
  id: "keep-it-balanced",
  title: "Keep both sides equal",
  tag: "Keep it",
  subtitle: "Do the same thing to both sides",
  steps: [
    // Pretest first - no instruction yet. x + 2 = 6.
    {
      type: "problem",
      prompt: "Get x by itself while keeping the scale level.",
      interaction: "remove-both-sides",
      initial: {
        left: [{ kind: "var", label: "x", weight: 4 }, { kind: "unit" }, { kind: "unit" }],
        right: Array.from({ length: 6 }, () => ({ kind: "unit" as const })),
      },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct:
          "Still level! You removed 2 from both sides, so x is alone and equals 4.",
        byMistake: {
          "one-side-only":
            "The scale tipped - you took blocks off one side but not the other. Whatever you remove from one side, remove from the other.",
          unbalanced: "Not level - make sure each side changes the same way.",
          "not-isolated": "Keep going - the mystery block isn't alone yet.",
        },
        default: "Keep the scale level and get x by itself.",
      },
      hint: "Remove the 2 single blocks from the left - and remove 2 from the right too.",
      // Easier: only one block to remove from each side (x + 1 = 4).
      easier: {
        type: "problem",
        prompt: "Warm-up: just one extra block. Remove 1 from each side to free x.",
        interaction: "remove-both-sides",
        initial: {
          left: [{ kind: "var", label: "x", weight: 3 }, { kind: "unit" }],
          right: Array.from({ length: 4 }, () => ({ kind: "unit" as const })),
        },
        validator: { kind: "isolate-variable" },
        feedback: {
          correct: "Level! One off each side leaves x = 3.",
          byMistake: {
            "one-side-only":
              "It tipped - take the block off both sides, not just one.",
            unbalanced: "Keep it level - change both sides the same way.",
            "not-isolated": "Almost - x still has a block with it.",
          },
          default: "Remove 1 block from both sides.",
        },
        hint: "Tap the single block on the left, then a block on the right.",
      },
    },
    {
      type: "concept",
      title: "The rule that never breaks",
      body:
        "Do the same thing to both sides and the scale stays level. Take 2 off the left, take 2 off the right.",
    },
    // Blocked practice: x + 5 = 9.
    {
      type: "problem",
      prompt: "Get x by itself again. Keep both sides equal.",
      interaction: "remove-both-sides",
      initial: {
        left: [
          { kind: "var", label: "x", weight: 4 },
          { kind: "unit" },
          { kind: "unit" },
          { kind: "unit" },
          { kind: "unit" },
          { kind: "unit" },
        ],
        right: Array.from({ length: 9 }, () => ({ kind: "unit" as const })),
      },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct: "Level and alone - x = 4. You removed 5 from each side.",
        byMistake: {
          "one-side-only":
            "Tipped! Remove the same number of blocks from both pans.",
          unbalanced: "Not balanced - change both sides the same way.",
          "not-isolated": "Almost - x still has extra blocks with it.",
        },
        default: "Remove equal blocks from both sides until x is alone.",
      },
      hint: "There are 5 single blocks with x. Remove 5 from both sides.",
    },
    // Blocked practice: x + 1 = 7.
    {
      type: "problem",
      prompt: "Last one. Get x by itself.",
      interaction: "remove-both-sides",
      initial: {
        left: [{ kind: "var", label: "x", weight: 6 }, { kind: "unit" }],
        right: Array.from({ length: 7 }, () => ({ kind: "unit" as const })),
      },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct: "Perfect - x = 6. Same move every time: balance both sides.",
        byMistake: {
          "one-side-only": "One side tipped. Take the same off both pans.",
          unbalanced: "Keep it level - mirror every move on both sides.",
          "not-isolated": "x isn't alone yet - one more block to remove from each side.",
        },
        default: "Remove the single block from both sides.",
      },
    },
  ],
};
