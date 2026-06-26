"use client";

// Client entry point for the AI tutor. The OpenAI key never lives here - the
// browser calls the `tutor` Cloud Function that holds the key. We call it through
// a same-origin Firebase Hosting rewrite (/api/tutor) rather than the callable
// SDK: this project's org policy blocks public (allUsers) invocation, but Hosting
// can invoke the function with its own identity. The function still verifies the
// Firebase ID token we send, so only signed-in learners get results.
//
// Opt-in: only active when Firebase is configured AND NEXT_PUBLIC_AI_ENABLED is
// "true". Otherwise the tutor calls return null and the UI uses authored hints.

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

/** Same-origin path mapped to the `tutor` function via the Hosting rewrite. */
const TUTOR_ENDPOINT = "/api/tutor";

export const isAiConfigured =
  isFirebaseConfigured && process.env.NEXT_PUBLIC_AI_ENABLED === "true";

/** A function that invokes the tutor backend and returns its `{ data }` payload. */
type TutorCaller = (req: unknown) => Promise<{ data: unknown }>;

/**
 * Returns a caller for the tutor backend, or null when AI is disabled. The caller
 * attaches a fresh Firebase ID token and uses the callable wire format
 * ({ data } in, { result } out) so the existing onCall function authenticates the
 * request. Throws on non-2xx so callers fall back to authored hints.
 */
export function getTutorCallable(): Promise<TutorCaller | null> {
  if (!isAiConfigured) return Promise.resolve(null);

  const caller: TutorCaller = async (req) => {
    const user = getFirebaseAuth()?.currentUser;
    const token = user ? await user.getIdToken() : null;
    const res = await fetch(TUTOR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ data: req }),
    });
    if (!res.ok) throw new Error(`tutor request failed: ${res.status}`);
    const json = (await res.json()) as { result?: unknown };
    return { data: json.result ?? null };
  };

  return Promise.resolve(caller);
}
