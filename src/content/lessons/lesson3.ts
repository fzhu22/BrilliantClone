import type { Lesson } from "../types";

const units = (n: number) =>
  Array.from({ length: n }, () => ({ kind: "unit" as const }));
const xs = (n: number, weight: number) =>
  Array.from({ length: n }, () => ({ kind: "var" as const, label: "x", weight }));

// Lesson 3 - "Variables on both sides."
// New move: take an x off BOTH sides to gather the variables together first.
// The numbers stay small so the new idea (gather the x's) is the hard part.
export const lesson3: Lesson = {
  id: "variables-both-sides",
  title: "Variables on both sides",
  tag: "Both sides",
  subtitle: "Gather the x's first",
  steps: [
    {
      type: "concept",
      title: "x can sit on both sides.",
      body:
        "When x appears on both pans, take one x off each side first. The scale stays level and the x's collect on one side.",
    },
    // 2x + 1 = x + 4  ->  x = 3
    {
      type: "problem",
      skill: "vars-both-sides",
      prompt: "Solve 2x + 1 = x + 4. Take an x off both sides first.",
      interaction: "remove-both-sides",
      removableVars: true,
      initial: { left: [...xs(2, 3), ...units(1)], right: [...xs(1, 3), ...units(4)] },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct:
          "Yes - x = 3! You took an x off both sides, then cleared the extra blocks.",
        byMistake: {
          "one-side-only":
            "The scale tipped - whatever you remove from one side, remove from the other.",
          unbalanced: "Keep it level - mirror every move on both sides.",
          "not-isolated":
            "Keep going! Take an x off both sides, then take the same units off both sides.",
        },
        default: "Take one x off each side, then clear the extra blocks from both sides.",
      },
      hint: "Tap an x to take one off both pans, then tap a unit to take one off both pans.",
      hintAfterAttempts: 1,
    },
    // Contrasting cases (SPOV 5): a sound solve vs a buggy one, side by side.
    {
      type: "contrast",
      skill: "vars-both-sides",
      prompt: "Two students solved 2x + 1 = x + 4. Which one kept the scale balanced?",
      left: {
        label: "Student A",
        lines: ["2x + 1 = x + 4", "take an x off BOTH sides", "x + 1 = 4", "x = 3"],
      },
      right: {
        label: "Student B",
        lines: ["2x + 1 = x + 4", "take an x off the LEFT only", "x + 1 = x + 4", "1 = 4 ??"],
      },
      options: [
        {
          id: "a",
          text: "Student A - they took an x off both sides.",
          correct: true,
          feedback:
            "Yes. Removing the same x from both sides keeps it balanced and gathers the x's on one side.",
        },
        {
          id: "b",
          text: "Student B - they took an x off one side.",
          correct: false,
          feedback:
            "B changed only one side, so the scale tipped - that's how you end up with nonsense like 1 = 4.",
        },
        {
          id: "both",
          text: "Both are fine.",
          correct: false,
          feedback:
            "Only A keeps both sides equal. B removed an x from one side only, breaking the balance.",
        },
      ],
    },
    {
      type: "concept",
      title: "Sometimes x's are left over.",
      body:
        "After gathering the x's you might have more than one. Then finish the way you always do: clear the units, then split.",
    },
    // 3x + 1 = x + 5  ->  2x + 1 = 5  ->  x = 2
    {
      type: "problem",
      skill: "vars-both-sides",
      prompt: "Solve 3x + 1 = x + 5.",
      interaction: "solve-equation",
      removableVars: true,
      initial: { left: [...xs(3, 2), ...units(1)], right: [...xs(1, 2), ...units(5)] },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct:
          "Brilliant - x = 2! One x off both sides left 2x + 1 = 5, then you cleared 1 and split in two.",
        byMistake: {
          "one-side-only": "Every move happens on both sides.",
          unbalanced: "Keep it level at each step.",
          "not-isolated":
            "Take an x off both sides, then clear the units, then split what is left.",
        },
        default: "Take an x off both sides, then solve the two-step that is left.",
      },
      hint: "Tap an x to clear one from both pans (2x + 1 = 5), tap a unit to clear one (2x = 4), then Split into 2 groups.",
      hintAfterAttempts: 1,
    },
  ],
};
