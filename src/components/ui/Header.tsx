"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, displayName } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { lessonOrder } from "@/content";
import { REWARDS_ENABLED } from "@/lib/config";
import { ALL_SKILL_IDS, masteredSkillCount } from "@/lib/scaffold";
import { StreakBadge } from "./StreakBadge";
import { ConfirmDialog } from "./ConfirmDialog";

export function Header() {
  const { user, configured, signOutUser } = useAuth();
  const { progress, points, resetProgress } = useProgress();
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [restarting, setRestarting] = useState(false);

  async function handleRestart() {
    setRestarting(true);
    await resetProgress();
    // Full navigation guarantees the lesson player remounts with cleared state.
    window.location.assign(`/lesson/${lessonOrder[0]}`);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span aria-hidden className="text-brand">
            &#9878;
          </span>
          <span>Balance</span>
        </Link>

        {configured && user ? (
          <div className="flex items-center gap-2 text-sm sm:gap-3">
            {/* SPOV 7: lead with a competence signal (skills mastered), not a
                points tally. Points/streak are demoted behind a flag. */}
            <span
              className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 font-semibold text-brand"
              title={`${masteredSkillCount(progress.skills)} of ${ALL_SKILL_IDS.length} skills mastered`}
              aria-label={`${masteredSkillCount(progress.skills)} of ${ALL_SKILL_IDS.length} skills mastered`}
            >
              <span aria-hidden>&#9733;</span>
              {masteredSkillCount(progress.skills)}/{ALL_SKILL_IDS.length} skills
            </span>
            {REWARDS_ENABLED && (
              <>
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 font-semibold text-brand"
                  title={`${points} points`}
                  aria-label={`${points} points`}
                >
                  <span aria-hidden>&#11088;</span>
                  {points}
                </span>
                <StreakBadge count={progress.streak?.count ?? 0} />
              </>
            )}
            <span className="hidden text-muted sm:inline">
              Hi, <span className="font-semibold text-ink">{displayName(user)}</span>
            </span>
            <button
              onClick={() => setConfirmRestart(true)}
              title="Restart course"
              aria-label="Restart course from the first lesson"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <span aria-hidden className="text-base leading-none">
                &#8635;
              </span>
            </button>
            <button
              onClick={() => void signOutUser()}
              className="rounded-lg border border-border px-3 py-1.5 font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              Sign out
            </button>
          </div>
        ) : configured ? (
          <Link
            href="/login"
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-bg"
          >
            Sign in
          </Link>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmRestart}
        title="Restart the whole course?"
        message="This erases all your progress and your streak, and starts you over at the very first lesson. This cannot be undone."
        confirmLabel="Erase and restart"
        cancelLabel="Keep my progress"
        busy={restarting}
        onConfirm={() => void handleRestart()}
        onCancel={() => setConfirmRestart(false)}
      />
    </header>
  );
}
