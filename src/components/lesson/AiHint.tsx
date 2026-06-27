"use client";

// Renders an AI-generated tutor hint. Mirrors the authored-hint card styling but
// adds a "Sage" label, a loading state (three pulsing dots), and an optional
// concept tag chip. Renders nothing when there is neither a hint nor loading.

import type { HintTier } from "@/lib/ai/hintLadder";

export function AiHint({
  loading,
  hint,
  conceptTag,
  tier,
  label,
}: {
  loading?: boolean;
  hint?: string | null;
  conceptTag?: string;
  /** Escalation tier; at tier 3 the label softens into "bigger hint". */
  tier?: HintTier;
  label?: string;
}) {
  if (!loading && !hint) return null;
  // An explicit label always wins; otherwise the wording escalates at tier 3.
  const displayLabel = label ?? (tier === 3 ? "Sage's bigger hint" : "Sage's hint");
  return (
    <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-ink">
      <span className="font-semibold text-info">{displayLabel}:</span>{" "}
      {loading ? (
        <span className="inline-flex items-center gap-1 align-middle" aria-label="Thinking">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-info [animation-delay:-0.2s]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-info" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-info [animation-delay:0.2s]" />
        </span>
      ) : (
        <>
          {hint}
          {conceptTag && (
            <span className="ml-2 rounded-full bg-info/15 px-2 py-0.5 text-xs font-semibold text-info">
              {conceptTag}
            </span>
          )}
        </>
      )}
    </div>
  );
}
