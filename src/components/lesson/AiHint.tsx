"use client";

// Renders an AI-generated tutor hint. Mirrors the authored-hint card styling but
// adds a "Sage" label, a loading state (three pulsing dots), and an optional
// concept tag chip. Renders nothing when there is neither a hint nor loading.

export function AiHint({
  loading,
  hint,
  conceptTag,
  label = "Sage's hint",
}: {
  loading?: boolean;
  hint?: string | null;
  conceptTag?: string;
  label?: string;
}) {
  if (!loading && !hint) return null;
  return (
    <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-sm text-ink">
      <span className="font-semibold text-info">{label}:</span>{" "}
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
