export function FeedbackBanner({
  correct,
  message,
}: {
  correct: boolean;
  message: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
        correct
          ? "border-success/40 bg-success/10 text-success"
          : "border-warn/40 bg-warn/10 text-warn"
      }`}
    >
      <span aria-hidden className="mt-0.5 text-base leading-none">
        {correct ? "\u2713" : "\u2192"}
      </span>
      <p className="text-ink">{message}</p>
    </div>
  );
}
