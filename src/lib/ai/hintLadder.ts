// Shared definition of the hint "ladder": how many wrong attempts move the
// learner to a more concrete tier of help. Kept pure (no React, no Firebase,
// no imports) so the same boundaries can be mirrored in the `tutor` Cloud
// Function, keeping the client cache key and the server prompt in sync.
//
// IMPORTANT: functions/src/index.ts mirrors hintTier + these constants. If you
// change the boundaries here, change them there too.

/** Wrong-attempt count at/after which a hint is at least tier 2 (more concrete). */
export const TIER2_AT = 2;
/** Wrong-attempt count at/after which a hint reaches tier 3 (most concrete). */
export const TIER3_AT = 4;

/** Tier of help: 1 = gentle nudge, 2 = concrete pointer, 3 = exact next move. */
export type HintTier = 1 | 2 | 3;

/**
 * Maps a 1-based wrong-attempt count to a hint tier. Higher tiers give more
 * concrete help, but never the answer (enforced by the tutor prompt).
 */
export function hintTier(attemptNumber: number): HintTier {
  if (attemptNumber >= TIER3_AT) return 3;
  if (attemptNumber >= TIER2_AT) return 2;
  return 1;
}
