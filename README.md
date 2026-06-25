# Balance — Learn Algebra by Doing

> **Subject: Algebra** (for middle-school learners). A learn-by-doing app modeled on
> Brilliant: no videos, no walls of text. Every lesson drops you into an interactive
> problem on a balance scale, gives instant, specific feedback, and reveals the idea
> only after you've tried it.

**The big concept:** *An equation is a balance. You solve it by keeping both sides equal.*

This is the **Phase 1 MVP** — it teaches entirely without AI. (AI features and
learning-science layers are planned for later phases.)

**Live demo:** https://brilliant-1fe5c.web.app/

---

## What it is

Three short, hands-on lessons that build on one idea, all on the same interactive
balance scale:

1. **See it — "A level scale means equal."** What `=` and a variable (`x`) really mean.
2. **Keep it — "Keep both sides equal."** Do the same thing to both sides.
3. **Use it — "Solve by isolating the variable."** Combine the moves to solve `2x + 1 = 7`.

Each problem is a real interaction (drag blocks, tap to remove, split into groups, or
pick a value), with instant misconception-aware feedback, a stated goal, a worked
example, hints after repeated misses, a course path with sequential unlock, progress
that persists across sessions and devices, and a daily streak.

---

## Tech stack

- **Next.js (App Router) + TypeScript**, static-exported for hosting.
- **Tailwind CSS** with a Brilliant-style dark theme (semantic tokens / CSS variables).
- **SVG + Pointer Events** for the balance-scale visual (touch + mouse, ~60 FPS).
- **Firebase Auth** (email/password + Google) and **Cloud Firestore** (progress,
  streak, history) with offline persistence.
- **Firebase Hosting** for deployment.

---

## Architecture overview

- **Content model** (`src/content/`): a lesson is a JSON-serializable sequence of typed
  steps (`concept` / `problem`), never an HTML blob. `validators.ts` holds pure,
  synchronous validation (well under the 100ms feedback budget) that also classifies
  specific mistakes for targeted feedback.
- **Balance-scale engine** (`src/components/scale/`): a responsive SVG component driven
  by a controlled `ScaleState`, with unified pointer drag, tap-to-remove, and fair
  split. `scaleLogic.ts` is pure (tilt, add/remove, split).
- **Lesson player** (`src/components/lesson/`): renders steps in a pretest-then-concept
  flow, shows instant feedback, hints, a progress bar, and a completion milestone.
- **Progress & auth** (`src/lib/`): React contexts. `progress.tsx` subscribes to the
  learner's Firestore doc, autosaves (debounced) and resumes the exact step;
  `courseStatus.ts` derives lesson lock/recommendation state; `auth.tsx` wraps Firebase
  Auth.

```
Learner (phone / tablet / desktop)
        |
   Next.js app (React + SVG, responsive)
    |        |              |
 Auth   Firestore     Lesson JSON
(email/  (progress,   (content model)
 Google)  streak)
        |
  Firebase Hosting
```

### Project structure

```
src/
  app/                 routes: home, /login, /lesson/[lessonId], /scale-demo
  components/
    scale/             BalanceScale + pure scaleLogic
    lesson/            LessonPlayer, ProblemRunner, feedback, progress, completion
    ui/                Button, NumberPad, Header, dialogs, badges
  content/             types, validators, lessons (1-3), course index
  lib/                 firebase, auth, progress, courseStatus, streak
```

---

## Setup guide

### 1. Prerequisites

- Node.js 18+ and npm.
- A Google account (for Firebase).

### 2. Install

```bash
npm install
```

### 3. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and create a project.
2. Add a **Web app** (`</>`) and copy its config values.
3. **Build → Authentication → Sign-in method:** enable **Email/Password** and **Google**.
4. **Build → Firestore Database → Create database** (production mode is fine — rules below lock it down).

### 4. Configure environment variables

Copy the example file and fill in your Web app config:

```bash
cp .env.local.example .env.local
```

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

These are public client keys; security comes from Auth + the Firestore rules below.

### 5. Set Firestore security rules

The repo includes `firestore.rules`, which lets each signed-in learner read/write only
their own progress document. Apply it either way:

- **Console:** Firestore Database → Rules → paste the contents of `firestore.rules` → Publish, or
- **CLI:** `firebase deploy --only firestore:rules` (after step 6).

### 6. Run locally

```bash
npm run dev
```

Open http://localhost:3000, create an account, and start learning.

---

## Build & deploy (Firebase Hosting)

The app is configured for static export (`output: "export"` in `next.config.mjs`), which
produces a static `out/` folder that scales to many concurrent learners.

```bash
# 1. Build the static site
npm run build           # outputs ./out

# 2. Install the Firebase CLI if needed, then sign in
npm install -g firebase-tools
firebase login

# 3. Point the CLI at your project (replace the placeholder in .firebaserc, or:)
firebase use --add

# 4. Deploy hosting (and optionally the Firestore rules)
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

After deploying, add the **Hosting URL** to the "Live demo" line at the top of this README.

> Tip: add your deployed domain under **Authentication → Settings → Authorized domains**
> so Google sign-in works in production.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production static export to `out/` |
| `npm run lint` | Lint the project |

---

## Notes & limitations (MVP)

- **No AI** anywhere in this MVP — all problems and feedback are hand-authored.
- Resume is **step-level** (returns you to the start of the step you left on).
- Drag-to-balance is pointer-based (touch + mouse); other answers are fully
  keyboard-accessible.
- `/scale-demo` is a developer playground for the scale engine and can be removed.
