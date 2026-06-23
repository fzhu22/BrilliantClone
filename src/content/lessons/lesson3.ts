import type { Lesson } from "../types";

// Lesson 3 - "Solve by isolating the variable."
// Small concept: combine the balance move with grouping (division) to solve
// real one- and two-step equations.
export const lesson3: Lesson = {
  id: "isolate-and-solve",
  title: "Solve by isolating the variable",
  tag: "Use it",
  subtitle: "Combine the moves to solve",
  steps: [
    // Pretest first - one step with multiplication. 3x = 12.
    {
      type: "problem",
      prompt:
        "Find what one mystery block weighs, keeping the scale level. Split both sides into equal groups.",
      interaction: "split-both-sides",
      initial: {
        left: [
          { kind: "var", label: "x", weight: 4 },
          { kind: "var", label: "x", weight: 4 },
          { kind: "var", label: "x", weight: 4 },
        ],
        right: Array.from({ length: 12 }, () => ({ kind: "unit" as const })),
      },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct:
          "One mystery block balances 4 - so x = 4. Splitting both sides into 3 equal groups kept it fair.",
        byMistake: {
          "one-side-only":
            "You split one side but not the other, so the scale tipped. Split both sides into the same number of groups.",
          unbalanced: "Not level - both sides must be split the same way.",
          "not-isolated": "Keep going until just one mystery block is left on its side.",
        },
        default: "Split both pans into equal groups, then keep one group on each side.",
      },
      hint: "There are 3 mystery blocks. Split both sides into 3 equal groups.",
    },
    {
      type: "concept",
      title: "Dividing is another fair move",
      body:
        "Splitting both sides into the same number of equal groups keeps the scale balanced - just like adding or removing the same amount. Same rule, new tool.",
    },
    // Challenge: two steps combined. 2x + 1 = 7.
    {
      type: "problem",
      prompt: "Solve for one mystery block. You'll need both moves.",
      interaction: "solve-equation",
      initial: {
        left: [
          { kind: "var", label: "x", weight: 3 },
          { kind: "var", label: "x", weight: 3 },
          { kind: "unit" },
        ],
        right: Array.from({ length: 7 }, () => ({ kind: "unit" as const })),
      },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct:
          "x = 3. You used both moves: take the same off both sides, then share both sides into equal groups.",
        byMistake: {
          "one-side-only": "The scale tipped - every move has to happen on both sides.",
          unbalanced: "Keep it level. Do the same thing to both pans at each step.",
          "not-isolated":
            "Not quite alone yet. Try removing the single block from both sides first, then split.",
        },
        default: "First remove the single block from both sides, then split what's left.",
      },
      hint: "Step 1: remove the 1 single block from both sides (2x = 6). Step 2: split both sides into 2 groups.",
      hintAfterAttempts: 1,
    },
    {
      type: "concept",
      title: "You solved an equation",
      body:
        "Every equation is a balance. You solve it by doing the same thing to both sides - remove, or split - until the variable is alone. That's the whole game.",
    },
  ],
};
