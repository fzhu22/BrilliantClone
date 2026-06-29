import type { Item, ScaleState } from "@/content/types";
import { sideTotal } from "@/content/validators";

export type Side = "left" | "right";

/** Maximum beam tilt in degrees (saturates so the scale never looks broken). */
const MAX_TILT_DEG = 10;

/** Beam tilt: positive means the left side is heavier (tips down on the left). */
export function tiltDegrees(state: ScaleState): number {
  const diff = sideTotal(state.left) - sideTotal(state.right);
  const norm = Math.max(-1, Math.min(1, diff / 6));
  return norm * MAX_TILT_DEG;
}

export function addToPan(state: ScaleState, side: Side, item: Item): ScaleState {
  return { ...state, [side]: [...state[side], item] };
}

export function removeFromPan(
  state: ScaleState,
  side: Side,
  index: number,
): ScaleState {
  return { ...state, [side]: state[side].filter((_, i) => i !== index) };
}

function varKey(item: Extract<Item, { kind: "var" }>): string {
  return `${item.label}:${item.weight}`;
}

/**
 * Splits one pan into `n` equal groups and keeps a single group. Returns null
 * if the contents can't be divided evenly (e.g. a stray unit), which is what
 * forces the learner to remove extras before dividing.
 */
function splitSide(items: Item[], n: number): Item[] | null {
  if (n < 2) return null;

  const units = items.filter((i) => i.kind === "unit").length;
  if (units % n !== 0) return null;

  const vars = items.filter(
    (i): i is Extract<Item, { kind: "var" }> => i.kind === "var",
  );
  const groups = new Map<string, { item: Extract<Item, { kind: "var" }>; count: number }>();
  for (const v of vars) {
    const k = varKey(v);
    const g = groups.get(k);
    if (g) g.count += 1;
    else groups.set(k, { item: v, count: 1 });
  }

  const out: Item[] = [];
  for (let i = 0; i < units / n; i++) out.push({ kind: "unit" });
  for (const { item, count } of groups.values()) {
    if (count % n !== 0) return null;
    for (let i = 0; i < count / n; i++) {
      out.push({ kind: "var", label: item.label, weight: item.weight });
    }
  }
  return out;
}

/**
 * Splits BOTH pans into `n` equal groups (a fair move). Returns null if either
 * side can't be divided evenly, or if nothing would change.
 */
export function splitBoth(state: ScaleState, n: number): ScaleState | null {
  const left = splitSide(state.left, n);
  const right = splitSide(state.right, n);
  if (!left || !right) return null;
  if (left.length === state.left.length && right.length === state.right.length) {
    return null;
  }
  return { left, right };
}

/** One side of the scale as a symbolic sum, e.g. "2x + 3", "x", or "0". */
function sideToExpr(items: Item[]): string {
  const varCounts = new Map<string, number>();
  let units = 0;
  for (const it of items) {
    if (it.kind === "unit") units += 1;
    else varCounts.set(it.label, (varCounts.get(it.label) ?? 0) + 1);
  }
  const terms: string[] = [];
  for (const [label, count] of [...varCounts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    terms.push(count === 1 ? label : `${count}${label}`);
  }
  // Show the constant only when there is one, or when the side is otherwise empty.
  if (units > 0 || terms.length === 0) terms.push(String(units));
  return terms.join(" + ");
}

/**
 * Renders a scale state as the symbolic equation it represents, e.g.
 * { left: [x, 1, 1], right: [1,1,1,1,1] } -> "x + 2 = 5". Uses block COUNTS and
 * labels only (never a variable's hidden weight), so it can be shown next to the
 * scale without revealing the answer. This is the bridge rung of concreteness
 * fading: the manipulative and the symbols, side by side and in lockstep.
 */
export function equationFromScale(state: ScaleState): string {
  return `${sideToExpr(state.left)} = ${sideToExpr(state.right)}`;
}
