import type { Lesson } from "../types";

// Lesson 5 - "Slope: rise over run."
// Second graphing lesson. Builds on y = mx + b by digging into the slope itself:
// a flat line (m = 0), a fractional/gentle slope (m = 1/2), and a steep downhill
// line (m = -2). Reuses the coordinate-grid match-line engine.
export const lesson5: Lesson = {
  id: "slope-rise-run",
  title: "Slope: rise over run",
  tag: "Slope",
  subtitle: "Flat, gentle, and steep lines",
  steps: [
    {
      type: "concept",
      title: "Slope is rise over run.",
      body:
        "The slope m counts how far a line climbs (the rise) for each step you take to the right (the run). Up to the right is positive, and a perfectly flat line has slope 0.",
    },
    // Flat line: m = 0.
    {
      type: "problem",
      prompt: "This line is flat. Match it.",
      interaction: "match-line",
      target: { m: 0, b: 3 },
      mRange: [-3, 3],
      bRange: [-5, 5],
      validator: { kind: "match-line" },
      feedback: {
        correct: "A flat line has slope 0 - y = 3 stays at 3 no matter what x is!",
        byMistake: {
          "intercept-off": "The line is flat (slope right) - slide b to where it sits.",
          "slope-off": "There's no climb at all, so set the slope m to 0.",
          "both-off": "A flat line has m = 0. It sits at 3, so b = 3.",
        },
        default: "A flat line has slope m = 0.",
      },
      hint: "No rise at all means m = 0. It sits at 3, so b = 3.",
    },
    {
      type: "concept",
      title: "Slopes can be fractions.",
      body:
        "A gentle line climbs less than 1 for each step across. A slope of 1/2 means it goes up 1 for every 2 steps right - rise 1 over run 2.",
    },
    // Fractional slope: m = 1/2. mStep lets the slope move in halves; b stays whole.
    {
      type: "problem",
      prompt: "Match this gentle climb. It goes up 1 for every 2 across.",
      interaction: "match-line",
      target: { m: 0.5, b: -1 },
      mRange: [-3, 3],
      bRange: [-5, 5],
      mStep: 0.5,
      validator: { kind: "match-line" },
      feedback: {
        correct: "Gentle and right - y = 0.5x - 1! Up 1 for every 2 across is a slope of 1/2.",
        byMistake: {
          "intercept-off": "Slope is right - slide b to the crossing point.",
          "slope-off": "Up 1 for every 2 across is m = 1/2. Nudge the slope to 0.5.",
          "both-off": "It crosses at -1, and climbs 1 for every 2 across (m = 1/2).",
        },
        default: "Up 1 for every 2 across is a half-step slope: m = 1/2.",
      },
      hint: "b = -1. Rise 1 over run 2 means m = 1/2 = 0.5.",
    },
    // Steep downhill: m = -2.
    {
      type: "problem",
      prompt: "Now a steep downhill line. Match it.",
      interaction: "match-line",
      target: { m: -2, b: 2 },
      mRange: [-3, 3],
      bRange: [-5, 5],
      validator: { kind: "match-line" },
      feedback: {
        correct: "You've got it - y = -2x + 2! It falls 2 for every 1 across.",
        byMistake: {
          "intercept-off": "Slope is right - slide b to fix the crossing point.",
          "slope-off": "Steep and downhill means a bigger negative slope. Try m = -2.",
          "both-off": "It crosses at 2 and falls 2 for every 1 across.",
        },
        default: "Downhill is a negative slope; steeper is a bigger number. Set b first, then m.",
      },
      hint: "b = 2. Falling 2 for every 1 across means m = -2.",
    },
  ],
};
