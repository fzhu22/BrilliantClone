import Link from "next/link";
import { BalanceScale } from "@/components/scale/BalanceScale";
import { lessons } from "@/content";
import type { ScaleState } from "@/content/types";

// A static, balanced scale (x = 5) used as the hero visual.
const heroScale: ScaleState = {
  left: [{ kind: "var", label: "x", weight: 5 }],
  right: Array.from({ length: 5 }, () => ({ kind: "unit" as const })),
};

const VALUE_PROPS = [
  {
    title: "No videos. You do.",
    body: "Every lesson is a problem you can touch, not a lecture you watch.",
  },
  {
    title: "Instant, helpful feedback",
    body: "Get something wrong and find out exactly why - then fix it yourself.",
  },
  {
    title: "Master it, then move on",
    body: "Lessons unlock as you go, so each idea is solid before the next.",
  },
];

export function Landing() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-20">
      {/* Hero */}
      <section className="flex flex-col items-center pt-12 text-center sm:pt-16">
        <span className="mb-4 inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
          Learn algebra by doing
        </span>
        <h1 className="text-balance text-4xl font-bold leading-tight sm:text-6xl">
          Algebra that finally <span className="text-brand">clicks</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted">
          Solve equations by hand on an interactive balance scale. Play with each
          idea until it makes sense&mdash;no videos, no walls of text.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-brand px-7 py-3 text-lg font-semibold text-bg shadow-card transition-transform hover:scale-[1.02] active:scale-95"
          >
            Get started &mdash; free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-surface px-7 py-3 text-lg font-semibold text-ink transition-colors hover:bg-surface2"
          >
            I have an account
          </Link>
        </div>
      </section>

      {/* Hero visual */}
      <section className="mt-12">
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-6">
          <BalanceScale state={heroScale} disabled capabilities={{}} />
          <p className="mt-2 text-center text-sm text-muted">
            A balanced scale is an equation. If <span className="text-brand">x</span>{" "}
            balances 5 blocks, then x = 5.
          </p>
        </div>
      </section>

      {/* Value props */}
      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {VALUE_PROPS.map((v) => (
          <div
            key={v.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-card"
          >
            <h3 className="font-semibold text-info">{v.title}</h3>
            <p className="mt-1.5 text-sm text-muted">{v.body}</p>
          </div>
        ))}
      </section>

      {/* Course preview */}
      <section className="mt-16">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted">
          Three lessons, one big idea
        </h2>
        <ol className="flex flex-col gap-3">
          {lessons.map((l, i) => (
            <li
              key={l.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 font-bold text-ink">
                {i + 1}
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-info">
                  {l.tag}
                </div>
                <div className="font-semibold">{l.title}</div>
                <div className="text-sm text-muted">{l.subtitle}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Bottom CTA */}
      <section className="mt-16 rounded-3xl border border-brand/30 bg-brand/5 p-8 text-center">
        <h2 className="text-2xl font-bold">Ready to make algebra click?</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Create a free account to start the first lesson and keep your progress.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-brand px-7 py-3 text-lg font-semibold text-bg shadow-card transition-transform hover:scale-[1.02] active:scale-95"
        >
          Get started
        </Link>
      </section>
    </main>
  );
}
