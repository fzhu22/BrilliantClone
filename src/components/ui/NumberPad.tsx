"use client";

export function NumberPad({
  choices,
  picked,
  correct,
  disabled,
  onPick,
}: {
  choices: number[];
  picked: number | null;
  correct: boolean | null;
  disabled: boolean;
  onPick: (value: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Answer choices"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {choices.map((value) => {
        const isPicked = picked === value;
        let tone = "border-border bg-surface2 text-ink hover:border-info";
        if (isPicked && correct) tone = "border-success bg-success/15 text-success";
        else if (isPicked && correct === false)
          tone = "border-warn bg-warn/15 text-warn";
        return (
          <button
            key={value}
            onClick={() => onPick(value)}
            disabled={disabled}
            aria-pressed={isPicked}
            className={`min-h-[3.25rem] touch-manipulation rounded-xl border-2 py-4 text-xl font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-info disabled:cursor-not-allowed disabled:opacity-60 ${tone}`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
