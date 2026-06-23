import type { Lesson } from "../types";

// Lesson 4 - "Lines: y = mx + b."
// New visual: a coordinate grid. Drag the m and b sliders to match a target line.
export const lesson4: Lesson = {
  id: "slope-intercept",
  title: "Lines: y = mx + b",
  tag: "Graph it",
  subtitle: "Slope and intercept",
  steps: [
    {
      type: "concept",
      title: "A line has an address: y = mx + b.",
      body:
        "b is the y-intercept - where the line crosses the up-and-down axis. Start by finding where the dashed line crosses it.",
    },
    {
      type: "problem",
      prompt: "Match the dashed line.",
      interaction: "match-line",
      target: { m: 1, b: 2 },
      mRange: [-3, 3],
      bRange: [-5, 5],
      validator: { kind: "match-line" },
      feedback: {
        correct: "Matched it - y = x + 2! It crosses the y-axis at 2 and climbs 1 each step.",
        byMistake: {
          "intercept-off": "The slope looks right - now slide b so it crosses the y-axis in the right spot.",
          "slope-off": "The crossing point is right - now change m so the tilt matches.",
          "both-off": "Start with b: where does the dashed line cross the y-axis?",
        },
        default: "Adjust the sliders until your line sits on the dashed one.",
      },
      hint: "It crosses the y-axis at 2, so b = 2. It goes up 1 for every 1 across, so m = 1.",
    },
    {
      type: "concept",
      title: "m is the slope.",
      body:
        "Slope is how steep the line is: how far it goes up for each step right. A bigger m tilts the line more.",
    },
    {
      type: "problem",
      prompt: "Match this steeper line.",
      interaction: "match-line",
      target: { m: 2, b: -1 },
      mRange: [-3, 3],
      bRange: [-5, 5],
      validator: { kind: "match-line" },
      feedback: {
        correct: "Nice - y = 2x - 1! It rises 2 for every 1 across.",
        byMistake: {
          "intercept-off": "Slope is right - slide b to fix where it crosses the y-axis.",
          "slope-off": "Crossing point is right - make it steeper or flatter with m.",
          "both-off": "It crosses the y-axis at -1, and it rises 2 each step.",
        },
        default: "Adjust both sliders until your line matches the dashed one.",
      },
      hint: "b = -1 (crosses below zero). It rises 2 for each 1 across, so m = 2.",
    },
    {
      type: "problem",
      prompt: "This line goes downhill. Match it.",
      interaction: "match-line",
      target: { m: -1, b: 3 },
      mRange: [-3, 3],
      bRange: [-5, 5],
      validator: { kind: "match-line" },
      feedback: {
        correct: "You nailed it - y = -x + 3! A negative slope means the line falls.",
        byMistake: {
          "intercept-off": "Slope is right - slide b to the right crossing point.",
          "slope-off": "A downhill line needs a negative m. Try -1.",
          "both-off": "It crosses the y-axis at 3 and falls 1 for every 1 across.",
        },
        default: "A downhill line has a negative slope. Set b first, then m.",
      },
      hint: "b = 3. Going down 1 for every 1 across means m = -1.",
    },
  ],
};
