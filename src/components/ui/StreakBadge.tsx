"use client";

export function StreakBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-warn/15 px-2.5 py-1 text-sm font-semibold text-warn"
      title={`${count}-day streak`}
      aria-label={`${count} day streak`}
    >
      <span aria-hidden className="flame-flicker">
        &#128293;
      </span>
      {count}
    </span>
  );
}
