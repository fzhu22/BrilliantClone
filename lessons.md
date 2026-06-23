# Algebra Course — Lesson Plan

**Subject:** Algebra
**Persona:** Middle school students, ages 11-14 (knows arithmetic, learning algebra)
**Goal:** A learn-by-doing course where each lesson teaches one concept through hands-on interaction, instant feedback, and a responsive visual — no AI in the MVP.

---

## The Big Concept (what the whole course is about)

**An equation is a balance you solve by keeping both sides equal — and a line is just an equation you can see.**

The course starts on an interactive balance scale (solving equations) and builds to a coordinate grid (graphing lines), so learners go from "what is x?" to "what does y = mx + b look like?"

---

## Design Principles (modeled on Brilliant)

These apply to **every** lesson:

- **Learn by doing, not by reading.** No videos, no walls of text. Each step is interactive.
- **Pretest before teaching.** Drop the learner into a problem before explaining; the explanation lands after the attempt.
- **One concept per lesson.** Start simple, then push to genuinely challenging.
- **Instant, specific feedback (<100ms).** Wrong answers get a short, hand-written explanation keyed to the specific mistake.
- **Scaffolding for stuck learners.** Hard problems offer a hint and an easier sub-problem after repeated misses.
- **A guide character ("Sage").** A friendly avatar presents the instructions in short, plain-language bubbles and points at the control to use.
- **Concepts build on one another.** Each lesson reuses and extends the last.
- **Responsive + multi-device, smooth at 60 FPS, and persistent** (resume, streak, points, mastery).

### Two reusable visual engines
- **Balance scale** — Lessons 1-3 (solving equations)
- **Coordinate grid** — Lessons 4-5 (graphing lines)

---

## Lesson 1 — Balance and the variable (Start)

- **Concept:** A level scale is an equation; a letter `x` is an unknown weight. Solve by keeping both sides equal.
- **Interactions:** drag-to-balance, choose-the-value, remove-from-both-sides.
- **Climax:** one-step equations like `x + 6 = 13`.

## Lesson 2 — Two-step equations (Build it)

- **Concept:** Undo adding (remove), then undo multiplying (split into equal groups).
- **Interactions:** split-both-sides, then combined solve.
- **Climax:** `2x + 3 = 11`, `4x + 1 = 13` (with an easier warm-up if stuck).

## Lesson 3 — Variables on both sides (Both sides)

- **Concept:** When `x` is on both pans, take one `x` off each side first to gather the variables, then finish normally.
- **Interactions:** remove-both-sides and solve, now with **removable variable blocks**.
- **Climax:** `2x + 3 = x + 7`, `3x + 2 = x + 8`.

## Lesson 4 — Lines: y = mx + b (Graph it)

- **Concept:** A line is `y = mx + b`: `b` is the y-intercept, `m` is the slope.
- **Interaction:** drag the `m` and `b` sliders to match a dashed target line on a coordinate grid.
- **Climax:** match `y = 2x - 1` and a downhill `y = -x + 3`.

## Lesson 5 — Slope: rise over run (Slope)

- **Concept:** Slope `m` is rise over run — how far the line climbs for each step right. A flat line is `0`, slopes can be fractions, and downhill is negative.
- **Interaction:** match-line on the grid, now with a half-step slope slider for fractional slopes.
- **Climax:** match a flat `y = 3`, a gentle `y = ½x − 1`, and a steep downhill `y = −2x + 2`.

---

## Why this sequence

It is one through-line, getting harder each step: **read x -> one-step -> two-step -> variables on both sides -> graph a line -> read its slope.** The balance metaphor carries solving all the way through Lesson 3, then Lessons 4-5 reveal that an equation can be *drawn* as a line, tying symbolic algebra to its picture. Every problem has a concrete misconception to write targeted feedback against.

For the **MVP (Phase 1)**, Lesson 1 is the single required deep lesson; Lessons 2-5 extend the path with progressively harder material and a second visual engine.

---

## Content model note (for build)

Each lesson is authored as a structured, JSON-serializable sequence of typed steps — `concept` and `problem`. A problem is either:
- a **scale problem** (`drag-balance`, `choose-number`, `remove-both-sides`, `split-both-sides`, `solve-equation`; optional `removableVars`), or
- a **graph problem** (`match-line` with a `target` of `{ m, b }` and slider ranges).

Each problem carries a validator, hand-written feedback keyed to specific mistakes, an optional hint, and (for hard ones) an easier scaffolded sub-problem. This is what lets us add lessons fast now, and (Phase 2) lets AI generate new problems at the right difficulty later.
