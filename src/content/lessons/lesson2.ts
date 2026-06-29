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
      skill: "two-step",
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
    // Worked example (study, don't solve) - consolidates the two-move method
    // before the learner does one alone. Fades once two-step is mastered.
    {
      type: "worked-example",
      skill: "two-step",
      title: "How to solve a two-step equation",
      prompt: "Here's how to solve 2x + 1 = 7, one fair move at a time.",
      frames: [
        {
          scale: { left: [...xs(2, 3), ...units(1)], right: units(7) },
          caption: "Start: 2x + 1 = 7. The scale balances, so both sides are equal.",
        },
        {
          scale: { left: xs(2, 3), right: units(6) },
          caption: "Undo the +1: take 1 block off BOTH sides. Now 2x = 6, still level.",
        },
        {
          scale: { left: xs(1, 3), right: units(3) },
          caption: "Undo the x2: split both sides into 2 equal groups. One x = 3.",
        },
      ],
    },
    // Spot-the-bug (SPOV 5): study an INCORRECT solve and find the faulty step.
    {
      type: "spot-bug",
      skill: "two-step",
      prompt: "Someone solved 2x + 1 = 7 like this. One step breaks a rule - which?",
      lines: [
        "1)  2x + 1 = 7",
        "2)  take 1 off the LEFT side:  2x = 7",
        "3)  split both sides in 2:  x = 3.5",
      ],
      options: [
        {
          id: "step2",
          text: "Step 2 - they took 1 off only the left side.",
          correct: true,
          feedback:
            "Right. Removing from one side only breaks the balance. It has to come off BOTH: 2x = 6, then x = 3.",
        },
        {
          id: "step3",
          text: "Step 3 - they split into the wrong number of groups.",
          correct: false,
          feedback:
            "The split itself was fair (both sides in 2). The real bug is step 2 - the 1 was only taken off the left.",
        },
        {
          id: "none",
          text: "Nothing is wrong - x = 3.5 is correct.",
          correct: false,
          feedback:
            "Look at step 2: taking 1 off only the left tips the scale. Done fairly, the answer is x = 3.",
        },
      ],
    },
    // Two-step: remove then split.
    {
      type: "problem",
      skill: "two-step",
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
    },
    // Bigger coefficient.
    {
      type: "problem",
      skill: "two-step",
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
