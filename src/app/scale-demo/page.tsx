"use client";

import { useState } from "react";
import {
  BalanceScale,
  type ScaleChange,
  type ScaleCapabilities,
  type TrayEntry,
} from "@/components/scale/BalanceScale";
import { sideTotal } from "@/content/validators";
import type { Item, ScaleState } from "@/content/types";

const units = (n: number): Item[] =>
  Array.from({ length: n }, () => ({ kind: "unit" as const }));

const lockedUnits = (n: number): Item[] =>
  Array.from({ length: n }, () => ({ kind: "unit" as const, locked: true }));

function Playground({
  title,
  initial,
  initialTray = [],
  capabilities,
}: {
  title: string;
  initial: ScaleState;
  initialTray?: Item[];
  capabilities: ScaleCapabilities;
}) {
  const [state, setState] = useState<ScaleState>(initial);
  const [tray, setTray] = useState<TrayEntry[]>(() =>
    initialTray.map((item) => ({ item })),
  );

  const onChange = (next: ScaleChange) => {
    setState(next.state);
    setTray(next.tray);
  };
  const reset = () => {
    setState(initial);
    setTray(initialTray.map((item) => ({ item })));
  };

  const l = sideTotal(state.left);
  const r = sideTotal(state.right);
  const balanced = l === r;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <button onClick={reset} className="text-xs text-muted hover:text-ink">
          Reset
        </button>
      </div>
      <BalanceScale
        state={state}
        tray={tray}
        capabilities={capabilities}
        onChange={onChange}
      />
      <div className="mt-3 flex items-center justify-center gap-4 text-sm">
        <span className="text-muted">
          Left <span className="font-bold text-ink">{l}</span>
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            balanced ? "bg-success/15 text-success" : "bg-warn/15 text-warn"
          }`}
        >
          {balanced ? "Balanced" : "Not level"}
        </span>
        <span className="text-muted">
          Right <span className="font-bold text-ink">{r}</span>
        </span>
      </div>
    </section>
  );
}

export default function ScaleDemoPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-8">
      <h1 className="text-center text-2xl font-bold">Balance scale playground</h1>
      <p className="text-center text-sm text-muted">
        A temporary page to test the scale engine. Try each interaction on touch
        and mouse.
      </p>

      <Playground
        title="Drag to balance (3 = ?)"
        initial={{ left: lockedUnits(3), right: [] }}
        initialTray={units(5)}
        capabilities={{ drag: true, removeUnits: true }}
      />

      <Playground
        title="Remove from both sides (x + 2 = 6)"
        initial={{
          left: [{ kind: "var", label: "x", weight: 4 }, { kind: "unit" }, { kind: "unit" }],
          right: units(6),
        }}
        capabilities={{ drag: true, removeUnits: true, paired: true }}
      />

      <Playground
        title="Split both sides (3x = 12)"
        initial={{
          left: [
            { kind: "var", label: "x", weight: 4 },
            { kind: "var", label: "x", weight: 4 },
            { kind: "var", label: "x", weight: 4 },
          ],
          right: units(12),
        }}
        capabilities={{ drag: true, removeUnits: true, split: true, paired: true }}
      />

      <Playground
        title="Solve (2x + 1 = 7): remove, then split"
        initial={{
          left: [
            { kind: "var", label: "x", weight: 3 },
            { kind: "var", label: "x", weight: 3 },
            { kind: "unit" },
          ],
          right: units(7),
        }}
        capabilities={{ drag: true, removeUnits: true, split: true, paired: true }}
      />
    </main>
  );
}
