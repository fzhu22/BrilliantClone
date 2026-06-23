"use client";

import { useEffect, useRef, useState } from "react";
import { Mascot } from "./Mascot";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

/** Types out `text` character-by-character; instant when reduced motion / skipped. */
function Typed({
  text,
  instant,
  onDone,
}: {
  text: string;
  instant: boolean;
  onDone: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (instant || reduced) {
      setCount(text.length);
      onDoneRef.current();
      return;
    }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        clearInterval(id);
        onDoneRef.current();
      }
    }, 18);
    return () => clearInterval(id);
  }, [text, instant, reduced]);

  return (
    <span>
      {text.slice(0, count)}
      {count < text.length && <span className="type-caret" aria-hidden />}
    </span>
  );
}

export function AvatarCoach({
  messages,
  onComplete,
}: {
  messages: string[];
  onComplete?: () => void;
}) {
  const blocks = messages.filter((m) => m && m.trim().length > 0);
  const [revealed, setRevealed] = useState(1);
  const [latestDone, setLatestDone] = useState(false);
  const [instant, setInstant] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset when the set of messages changes (e.g., moving to a new step).
  useEffect(() => {
    setRevealed(1);
    setLatestDone(false);
    setInstant(false);
  }, [blocks.length, blocks[0]]);

  // Auto-advance: a short beat after the current bubble finishes typing, reveal
  // the next one (no Next button needed).
  useEffect(() => {
    if (revealed < blocks.length && latestDone) {
      const t = setTimeout(() => {
        setLatestDone(false);
        setRevealed((r) => r + 1);
      }, 750);
      return () => clearTimeout(t);
    }
  }, [revealed, latestDone, blocks.length]);

  // Notify once the whole intro has been shown.
  useEffect(() => {
    if (revealed >= blocks.length && latestDone) onCompleteRef.current?.();
  }, [revealed, latestDone, blocks.length]);

  if (blocks.length === 0) return null;

  const allShown = revealed >= blocks.length && latestDone;
  const showSkip = !allShown && blocks.length > 1;

  function skip() {
    setInstant(true);
    setLatestDone(true);
    setRevealed(blocks.length);
  }

  return (
    <div className="flex items-start gap-3">
      <div className="sticky top-16 shrink-0">
        <Mascot speaking={!latestDone} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-xs font-semibold text-brand">Sage</div>
        <div aria-live="polite" className="flex flex-col gap-2">
          {blocks.slice(0, revealed).map((m, i) => (
            <div
              key={i}
              className="rounded-2xl rounded-tl-sm border border-border bg-surface px-3 py-2 text-sm text-ink shadow-card"
            >
              {i === revealed - 1 ? (
                <Typed
                  text={m}
                  instant={instant}
                  onDone={() => setLatestDone(true)}
                />
              ) : (
                m
              )}
            </div>
          ))}
        </div>

        {showSkip && (
          <div className="mt-2">
            <button
              onClick={skip}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
