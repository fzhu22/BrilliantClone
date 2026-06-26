"use client";

// High-level tutor calls. Safe to call unconditionally: they return null when AI
// is disabled or anything goes wrong, so the UI falls back to authored hints and
// the local mastery heuristic. Prompts + the OpenAI call live in the `tutor`
// Cloud Function; here we send structured context and validate what comes back.

import { getTutorCallable, isAiConfigured } from "./client";
import type {
  AttemptContext,
  HintResult,
  MasteryResult,
  MasterySummary,
  ProblemContext,
} from "./types";

/** Sends a request to the tutor function and returns its `{ data }` payload. */
async function callTutor(req: Record<string, unknown>): Promise<unknown | null> {
  if (!isAiConfigured) return null;
  try {
    const call = await getTutorCallable();
    if (!call) return null;
    const res = await call(req);
    return res.data ?? null;
  } catch {
    return null;
  }
}

// Reuse a hint across identical (problem, mistake) situations to limit calls.
const hintCache = new Map<string, HintResult>();

export async function generateHint(
  problem: ProblemContext,
  attempt: AttemptContext,
): Promise<HintResult | null> {
  if (!isAiConfigured) return null;
  const key = `${problem.lessonId}:${problem.stepIndex}:${attempt.mistake ?? "?"}`;
  const cached = hintCache.get(key);
  if (cached) return cached;

  const data = (await callTutor({ kind: "hint", problem, attempt })) as
    | Partial<HintResult>
    | null;
  if (data && typeof data.hint === "string" && data.hint.trim()) {
    const out: HintResult = {
      hint: data.hint.trim(),
      conceptTag: data.conceptTag?.trim() || undefined,
    };
    hintCache.set(key, out);
    return out;
  }
  return null;
}

/**
 * Ask the AI to gauge how well the learner mastered a lesson from their solve
 * history. Returns a clamped percentage + badge decision + summary, or null on
 * failure so the caller can fall back to the local first-try heuristic.
 */
export async function assessMastery(
  lesson: MasterySummary,
): Promise<MasteryResult | null> {
  if (!isAiConfigured) return null;

  const data = (await callTutor({ kind: "mastery", lesson })) as
    | Partial<MasteryResult>
    | null;
  if (data && typeof data.masteryPercent === "number" && typeof data.mastered === "boolean") {
    return {
      masteryPercent: Math.max(0, Math.min(100, Math.round(data.masteryPercent))),
      mastered: data.mastered,
      summary: typeof data.summary === "string" ? data.summary : "",
    };
  }
  return null;
}
