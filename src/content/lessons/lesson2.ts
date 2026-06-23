import type { Lesson } from "../types";

const units = (n: number) =>
  Array.from({ length: n }, () => ({ kind: "unit" as const }));
const xs = (n: number, weight: number) =>
  Array.from({ length: n }, () => ({ kind: "var" as const, label: "x", weight }));

// Lesson 2 - "Two-step equations."
// Introduce dividing (split), then combine remove + split to solve 2x + 1 = 7.
// Small numbers keep the focus on the two moves, not on counting blocks.
export const lesson2: Lesson = {
  id: "two-step-equations",
  title: "Two-step equations",
  tag: "Build it",
  subtitle: "Undo adding, then undo multiplying",
  steps: [
    // Pretest: division alone.
    {
      type: "problem",
      prompt: "Three x's balance 6. Split both sides to find one x.",
      interaction: "split-both-sides",
      initial: { left: xs(3, 2), right: units(6) },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct: "One x balances 2, so x = 2! Splitting both sides kept it fair.",
        byMistake: {
          "one-side-only":
            "You split one side only, so it tipped. Split both sides the same way.",
          unbalanced: "Not level - divide both sides into the same number of groups.",
          "not-isolated": "Keep one group on each side so a single x is left.",
        },
        default: "Set the groups to 3 and tap Split.",
      },
      hint: "There are 3 x's, so make 3 groups.",
    },
    {
      type: "concept",
      title: "Dividing is a fair move.",
      body:
        "Splitting both sides into the same number of equal groups keeps the scale level, just like adding or removing the same amount.",
    },
    // Two-step: remove then split.
    {
      type: "problem",
      prompt: "Solve 2x + 1 = 7. You will need both moves.",
      interaction: "solve-equation",
      initial: { left: [...xs(2, 3), ...units(1)], right: units(7) },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct:
          "You did it - x = 3! First you took 1 off each side, then split both sides in two.",
        byMistake: {
          "one-side-only": "The scale tipped - every move happens on both sides.",
          unbalanced: "Keep it level - do the same to both pans at each step.",
          "not-isolated": "Almost! Take the single block off both sides first, then split.",
        },
        default: "Take the single block off both sides, then split what is left.",
      },
      hint: "Step 1: take 1 off each side (2x = 6). Step 2: split both sides into 2 groups.",
      hintAfterAttempts: 1,
      easierAfterAttempts: 1,
      easier: {
        type: "problem",
        prompt: "Warm-up: the +1 is gone. Split 2x = 6 to find one x.",
        interaction: "split-both-sides",
        initial: { left: xs(2, 3), right: units(6) },
        validator: { kind: "isolate-variable" },
        feedback: {
          correct: "Split into 2 groups and one x balances 3. x = 3!",
          byMistake: {
            "one-side-only": "Split both sides the same way.",
            unbalanced: "Keep it level - divide both pans into 2 groups.",
            "not-isolated": "Keep one group on each side.",
          },
          default: "Set the groups to 2 and tap Split.",
        },
        hint: "Make 2 groups, then go back and take the +1 off both sides first.",
      },
    },
    // Bigger coefficient.
    {
      type: "problem",
      prompt: "Solve 3x + 2 = 8.",
      interaction: "solve-equation",
      initial: { left: [...xs(3, 2), ...units(2)], right: units(8) },
      validator: { kind: "isolate-variable" },
      feedback: {
        correct: "Excellent - x = 2! Take 2 off each side, then split into 3 groups.",
        byMistake: {
          "one-side-only": "Both sides must change together.",
          unbalanced: "Keep it level at every step.",
          "not-isolated": "Take the 2 single blocks off both sides first, then split into 3.",
        },
        default: "Clear the 2 from both sides, then split into 3 equal groups.",
      },
      hint: "Step 1: take 2 off each side (3x = 6). Step 2: split both sides into 3 groups.",
    },
  ],
};
