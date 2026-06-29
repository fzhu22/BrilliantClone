import type { Lesson } from "../types";

// Lesson 0 - "What the equals sign means."
// SPOV 2: the single most predictive algebra misconception is reading "=" as
// "the answer comes next" (operational) instead of "both sides are the same"
// (relational). This lesson attacks it directly with non-standard forms - blanks
// that aren't on the right, and an "answer-first" equation - and doubles as the
// diagnostic that gates the rest of the course (mastery-gating in courseStatus).
// It opens explore-first (judge before any instruction) per SPOV 5.
export const lessonEqualSign: Lesson = {
  id: "equals-means-same",
  title: "What the equals sign means",
  tag: "Start",
  subtitle: "= means the two sides are the same",
  steps: [
    // Explore-first: judge before any instruction (no hint held out).
    {
      type: "problem",
      skill: "equal-sign",
      explore: true,
      interaction: "judge-equation",
      prompt: "Quick gut check - is this true?",
      equation: "3 + 4 = 5 + 2",
      validator: { kind: "equation-true", isTrue: true },
      feedback: {
        correct: "Yes! Both sides make 7, so they are equal - that is what = means.",
        byMistake: {
          "operational-read":
            "Add each side: 3 + 4 is 7, and 5 + 2 is 7. Same amount, so it is true.",
        },
        default: "Add up each side and compare the totals.",
      },
    },
    // The "answer first" form trips up operational readers.
    {
      type: "problem",
      skill: "equal-sign",
      interaction: "judge-equation",
      prompt: "Is this one true?",
      equation: "8 = 5 + 3",
      validator: { kind: "equation-true", isTrue: true },
      feedback: {
        correct: "True! The total can sit on the left. = just means both sides match.",
        byMistake: {
          "operational-read":
            "= does not mean 'the answer goes on the right'. 8 and 5 + 3 are both 8, so it is true.",
        },
        default: "Both sides are 8, so is it true?",
      },
      hint: "There is no rule that the answer must be on the right. Compare the totals.",
    },
    {
      type: "concept",
      title: "= means 'the same as'.",
      body:
        "The equals sign is not a 'write the answer' button. It means the two sides are worth the same - exactly like a balanced scale. Either side can hold the bigger expression.",
    },
    // Non-standard: the blank is on the RIGHT, with the left total as the trap.
    {
      type: "problem",
      skill: "equal-sign",
      interaction: "fill-blank",
      prompt: "Fill the blank so both sides are equal.",
      equation: "3 + 4 = ? + 5",
      choices: [2, 7, 9, 12],
      validator: { kind: "fill-blank", answer: 2, operational: 7 },
      feedback: {
        correct: "Exactly - 2 + 5 is 7, matching 3 + 4. Both sides are the same.",
        byMistake: {
          "operational-sum":
            "7 is just the left side. The right side already has + 5, so the blank must be 2.",
          "wrong-number": "Both sides must total 7, so the blank plus 5 has to be 7.",
        },
        default: "Make the right side total 7 as well.",
      },
      hint: "Left side is 7. So ? + 5 must also be 7.",
    },
    // A false statement - they must reject it.
    {
      type: "problem",
      skill: "equal-sign",
      interaction: "judge-equation",
      prompt: "True or false?",
      equation: "6 + 3 = 6 + 4",
      validator: { kind: "equation-true", isTrue: false },
      feedback: {
        correct: "Right - 9 is not 10, so the sides are not equal. False.",
        byMistake: {
          "operational-read":
            "Compare totals: 6 + 3 is 9 but 6 + 4 is 10. Not the same, so it is false.",
        },
        default: "Add each side - do they match?",
      },
      hint: "One side is 9, the other is 10.",
    },
    // One more right-blank to confirm the relational read.
    {
      type: "problem",
      skill: "equal-sign",
      interaction: "fill-blank",
      prompt: "Last one - fill the blank.",
      equation: "2 + 6 = ? + 3",
      choices: [5, 8, 9, 11],
      validator: { kind: "fill-blank", answer: 5, operational: 8 },
      feedback: {
        correct: "Nice - 5 + 3 is 8, matching 2 + 6. Both sides equal.",
        byMistake: {
          "operational-sum": "8 is the left total. The blank plus 3 must be 8, so it is 5.",
          "wrong-number": "Both sides must total 8.",
        },
        default: "Make the right side total 8.",
      },
      hint: "Left side is 8, so ? + 3 = 8.",
    },
  ],
};
