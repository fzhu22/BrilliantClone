import type { Lesson } from "../types";

// Lesson 1 - "A level scale means equal."
// Small concept: a level scale means the two sides are equal (that is what =
// means), and a mystery block is a variable: an unknown weight.
export const lesson1: Lesson = {
  id: "level-means-equal",
  title: "A level scale means equal",
  tag: "See it",
  subtitle: "What = and x really mean",
  steps: [
    // Pretest first - no instruction yet.
    {
      type: "problem",
      prompt: "Drag blocks onto the right pan until the scale is level.",
      interaction: "drag-balance",
      initial: {
        // The left pan is the given target (locked, shown in gray) so the
        // learner must match it rather than emptying both sides.
        left: [
          { kind: "unit", locked: true },
          { kind: "unit", locked: true },
          { kind: "unit", locked: true },
        ],
        right: [],
      },
      tray: [
        { kind: "unit" },
        { kind: "unit" },
        { kind: "unit" },
        { kind: "unit" },
        { kind: "unit" },
      ],
      validator: { kind: "sides-equal" },
      feedback: {
        correct:
          "Level! Both pans weigh 3. When a scale balances, the two sides are equal - that's what the = sign means.",
        byMistake: {
          "too-light": "The right side is still up - it's lighter. Add another block.",
          "too-heavy": "Now the right side dropped - it's too heavy. Take one off.",
          empty: "The pans are empty - drag blocks on so there's something to balance.",
        },
        default: "Not level yet - compare the two pans.",
      },
      hint: "Count the blocks on the left. Make the right pan match.",
    },
    {
      type: "concept",
      title: "A balanced scale is an equation",
      body:
        "When the scale is level, both sides weigh the same. That is what the equals sign (=) means.",
    },
    // Introduce the variable as an unknown weight on an already-balanced scale.
    {
      type: "problem",
      prompt: "The scale is balanced. How much does the mystery block x weigh?",
      interaction: "choose-number",
      initial: {
        left: [{ kind: "var", label: "x", weight: 5 }],
        right: [
          { kind: "unit" },
          { kind: "unit" },
          { kind: "unit" },
          { kind: "unit" },
          { kind: "unit" },
        ],
      },
      choices: [3, 5, 8, 10],
      validator: { kind: "choose-number", answer: 5 },
      feedback: {
        correct: "Right - x is just a name for an unknown weight. Here it's 5.",
        byMistake: {
          "wrong-number":
            "If x balances 5 blocks, it must weigh the same as 5 blocks. Look at the right pan.",
        },
        default: "Look at the right pan: how many blocks does x balance?",
      },
      hint: "A balanced scale means both sides weigh the same. Count the right pan.",
    },
    {
      type: "concept",
      title: "A variable is an unknown weight",
      body:
        "A letter like x is just a number we don't know yet. On a level scale, the other side tells us what it is.",
    },
    // Blocked practice: two more reads.
    {
      type: "problem",
      prompt: "Balanced again. What does x weigh now?",
      interaction: "choose-number",
      initial: {
        left: [{ kind: "var", label: "x", weight: 8 }],
        right: Array.from({ length: 8 }, () => ({ kind: "unit" as const })),
      },
      choices: [5, 6, 8, 11],
      validator: { kind: "choose-number", answer: 8 },
      feedback: {
        correct: "Yes - x weighs 8, the same as the 8 blocks it balances.",
        byMistake: {
          "wrong-number": "Count the blocks on the right pan - that's what x must weigh.",
        },
        default: "Count the right pan to find x.",
      },
    },
    {
      type: "problem",
      prompt: "One more. What does x weigh here?",
      interaction: "choose-number",
      initial: {
        left: [{ kind: "var", label: "x", weight: 2 }],
        right: [{ kind: "unit" }, { kind: "unit" }],
      },
      choices: [1, 2, 4, 6],
      validator: { kind: "choose-number", answer: 2 },
      feedback: {
        correct: "Exactly - a small x this time. It weighs 2.",
        byMistake: {
          "wrong-number": "The right pan has just 2 blocks, so x must weigh 2.",
        },
        default: "How many blocks does x balance?",
      },
    },
  ],
};
