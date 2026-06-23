# Algebra Course — Lesson Plan

**Subject:** Algebra
**Persona:** Middle school students (knows arithmetic, new to variables)
**Goal:** A learn-by-doing course where each lesson teaches *one* small concept through hands-on interaction, instant feedback, and a responsive visual — no AI in the MVP.

---

## The Big Concept (what the whole course is about)

**An equation is a balance. You solve it by keeping both sides equal.**

All three lessons live inside this one idea and build directly on each other:

1. **See it** — a level scale means two sides are equal; a mystery block is a variable. (What `=` and `x` mean.)
2. **Keep it** — to stay balanced, do the same thing to both sides. (The move that solves equations.)
3. **Use it** — apply the balance move step by step to isolate the variable and solve. (Putting it together.)

By the end, a learner who started not knowing what `x` means can solve `2x + 1 = 7` and explain *why* each step is legal — because the scale stayed balanced.

---

## Design Principles (modeled on Brilliant)

These apply to **every** lesson:

- **Learn by doing, not by reading.** No videos, no walls of text. Each step is interactive.
- **Pretest before teaching.** Drop the learner into a problem *before* explaining the concept. Let them try (and often get it wrong); the explanation lands *after* the struggle.
- **One small concept per lesson.** Start with the simplest version of the idea to minimize cognitive load.
- **Blocked practice.** Two or three similar problems in a row to build fluency, then combine ideas.
- **Instant, specific feedback (<100ms).** Never a bare red X. Wrong answers get a short, hand-written explanation of *why*, keyed to the specific mistake / common misconception.
- **Explain after correct answers too.** The concept reveal shows even when they get it right — that's often where understanding forms.
- **Concepts build on one another.** Each lesson reuses and extends the last, all on the same scale.
- **Bite-sized.** ~5 minutes each. Finishing should feel good.
- **Responsive + multi-device.** All drag/tap interactions work with touch, mouse, and keyboard, and the visual scales cleanly across phone, tablet, and desktop in any orientation.
- **Smooth at 60 FPS.** The scale tips and levels live as the learner acts.
- **Persistent.** Progress saves continuously at the step level; a learner can leave mid-lesson and resume the exact step on any device.

### One reusable visual engine
The entire course reuses a **single** visual component — an interactive **balance scale** with pans, unit blocks, and labeled mystery blocks. Building one engine well (and reusing it three times) keeps the MVP scope realistic while letting each lesson go deep.

---

## Lesson 1 — A level scale means "equal"

- **Small concept:** When a scale is level, the two sides weigh the same. That is exactly what `=` means, and a mystery block is a variable — an unknown weight.
- **Signature interaction:** Drag unit blocks onto a pan and watch the beam tip until it levels.

**Concrete step sequence:**
1. **Pretest (no instruction yet).** Left pan holds 3 unit blocks; right pan is empty. Prompt: "Drag blocks onto the right pan until the scale is level." The beam tips in real time as blocks are added.
   - Feedback if right side is lighter: "The right side is still up — it's lighter. Add another block."
   - Feedback if right side is heavier: "Now the right side dropped — it's too heavy. Take one off."
   - Feedback when level (3 = 3): "Level! Both pans weigh 3. When a scale balances, the two sides are equal — that's what the `=` sign means."
2. **Concept reveal.** A short line + the leveled scale: "A balanced scale = an equation. Both sides are equal."
3. **Introduce the variable.** A mystery block labeled `x` sits on the left; the right pan holds 5 unit blocks and the scale is already level. Prompt (tap a number): "If the scale is balanced, how much does `x` weigh?" Answer: 5.
   - Feedback for a wrong number: "If `x` balanced 5 blocks, it must weigh the same as 5 blocks. Look at the right pan."
   - Feedback correct: "Right — `x` is just a name for an unknown weight. Here it's 5."
4. **Blocked practice.** Two more "what does `x` weigh?" problems with different totals (e.g. `x` vs 8; `x` vs 2).

- **Misconceptions to write feedback for:**
  - Treating `x` as a label/letter rather than a hidden number.
  - Thinking the sides can differ and still be "equal."

## Lesson 2 — Keep both sides equal

- **Small concept:** To keep a scale level, you must do the *same thing to both sides*. This is the one move that solves equations.
- **Signature interaction:** Tap blocks to remove (or add) the same amount from each pan; the beam stays level only if you keep it fair.

**Concrete step sequence:**
1. **Pretest (no instruction yet).** A level scale: left pan has a mystery block `x` plus 2 unit blocks (`x + 2`); right pan has 6 unit blocks. Prompt: "Get the mystery block alone on its pan, keeping the scale level." The learner taps blocks to remove them.
   - Feedback if they remove 2 from the left only: "The scale tipped — you took 2 off the left but not the right. Whatever you remove from one side, remove from the other."
   - Feedback if they remove from the right only: "Now the left is heavier. To stay level, change both sides the same way."
   - Feedback when they remove 2 from each side (leaving `x` = 4): "Still level! You removed 2 from both sides, so `x` is alone and equals 4."
2. **Concept reveal.** "The rule that never breaks: do the same thing to both sides, and the scale stays balanced."
3. **Blocked practice.** Two more isolate-the-variable problems using add/remove on both sides (e.g. `x + 5 = 9`; `x + 1 = 7`), each verified by the scale staying level.

- **Misconceptions to write feedback for:**
  - Operating on only one side ("you removed 3 from the left but not the right").
  - Removing unequal amounts from each side.

## Lesson 3 — Solve by isolating the variable

- **Small concept:** Combine the balance move with grouping (division) to solve real one- and two-step equations.
- **Signature interaction:** Tap to remove equal amounts from both sides, and tap to split both pans into equal groups; a "check" re-weighs to prove the equation is true.

**Concrete step sequence:**
1. **Pretest — one step with multiplication (no instruction yet).** A level scale: left pan has 3 mystery blocks (`3x`); right pan has 12 unit blocks. Prompt: "Find what one mystery block weighs, keeping the scale level." The learner splits both pans into 3 equal groups and keeps one group on each side.
   - Feedback if they split only one side: "You split the left into 3 groups but left the right whole — the scale tipped. Split both sides into the same number of groups."
   - Feedback correct (`x` = 4): "One mystery block balances 4 — so `x = 4`. Splitting both sides into 3 equal groups kept it fair."
2. **Concept reveal.** "Dividing both sides by the same number is just another fair move. Same rule, new tool."
3. **Challenge — two steps combined.** A level scale: left pan has 2 mystery blocks plus 1 unit block (`2x + 1`); right pan has 7 unit blocks. Prompt: "Solve for one mystery block." Expected moves: remove 1 from both sides (`2x = 6`), then split both sides into 2 groups (`x = 3`).
   - Feedback if they try to split before removing the extra block: "Try removing the single block from both sides first, then split — otherwise the groups aren't even."
   - Feedback correct: "`x = 3`. You used both moves: take the same off both sides, then share both sides into equal groups."
4. **Check step.** Substitute back: the scale re-weighs `2(3) + 1` against `7` and levels. "It balances — your answer is correct."

- **Misconceptions to write feedback for:**
  - Dividing/grouping only one side.
  - Doing the two steps in the wrong order (dividing before clearing the added term).

---

## Why this sequence

It is one idea taught three times, each time with a new move, all on the same scale:

**equal (see it) → same-thing-to-both-sides (keep it) → isolate & solve (use it)**

Because every lesson reuses the balance metaphor and the single visual engine, the learner never context-switches — they just get a sharper tool for the same job. Lesson 3's two-step problem visibly combines everything from Lessons 1 and 2, so finishing the course *feels* like mastering one coherent skill, not three disconnected tricks. Every step has a concrete misconception to write targeted feedback against.

For the **MVP (Phase 1)**, Lesson 1 is built deep and polished as the single required lesson; Lessons 2 and 3 form the immediate course path that follows it.

---

## Content model note (for build)

Each lesson will be authored as a structured JSON sequence of typed steps — `concept`, `problem`, `feedback` — never HTML blobs. Each `problem` step carries:
- prompt
- interaction type (for this course: `drag-balance`, `remove-both-sides`, `split-both-sides`, and `multiple-choice` for the "what does x weigh?" taps)
- correct answer / validator (e.g. "sides level", "variable isolated", "x equals N")
- hand-written feedback keyed to specific wrong answers / misconceptions

This is what lets us add lessons fast now, and (Phase 2) lets AI generate new balance-scale problems at the right difficulty later.
