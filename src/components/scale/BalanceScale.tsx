"use client";

import { useRef, useState } from "react";
import type { Item, ScaleState } from "@/content/types";
import {
  addToPan,
  removeFromPan,
  splitBoth,
  tiltDegrees,
  type Side,
} from "./scaleLogic";

export interface ScaleCapabilities {
  /** Drag unit blocks from the tray onto a pan (Lesson 1). */
  drag?: boolean;
  /** Tap a unit block to remove it from its pan (Lesson 2). */
  removeUnits?: boolean;
  /** Split both pans into equal groups (Lesson 3). */
  split?: boolean;
}

export interface ScaleChange {
  state: ScaleState;
  tray: Item[];
}

interface Props {
  state: ScaleState;
  tray?: Item[];
  capabilities?: ScaleCapabilities;
  onChange?: (next: ScaleChange) => void;
  disabled?: boolean;
  /** Pulse-highlight a specific control while the avatar points at it. */
  highlight?: "tray" | "split" | "blocks";
}

// ViewBox geometry. All drawing is in these coordinates; the SVG scales
// fluidly to any screen via preserveAspectRatio.
const VB_W = 400;
const VB_H = 320;
const PIVOT = { x: 200, y: 96 };
const ARM = 120;
const STRING = 24;
const CELL = 22;
const GAP = 5;
const COLS = 6;
const PAN_HALF = 82;

type EndPoints = {
  left: { x: number; y: number };
  right: { x: number; y: number };
};

function endpoints(tiltDeg: number): EndPoints {
  const a = (tiltDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    left: { x: PIVOT.x - ARM * cos, y: PIVOT.y + ARM * sin },
    right: { x: PIVOT.x + ARM * cos, y: PIVOT.y - ARM * sin },
  };
}

function blockPos(i: number, total: number, centerX: number, baseY: number) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const inRow = Math.min(COLS, total - row * COLS);
  const rowWidth = inRow * CELL + (inRow - 1) * GAP;
  const startX = centerX - rowWidth / 2;
  return {
    x: startX + col * (CELL + GAP),
    y: baseY - CELL - row * (CELL + GAP),
  };
}

export function BalanceScale({
  state,
  tray = [],
  capabilities = {},
  onChange,
  disabled = false,
  highlight,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{
    trayIndex: number;
    item: Item;
    x: number;
    y: number;
  } | null>(null);
  const [groups, setGroups] = useState(3);
  const [splitMsg, setSplitMsg] = useState<string | null>(null);

  const tilt = tiltDegrees(state);
  const ends = endpoints(tilt);

  function toSvg(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function zoneAt(x: number, y: number): Side | null {
    for (const side of ["left", "right"] as const) {
      const cx = ends[side].x;
      const baseY = ends[side].y + STRING;
      if (Math.abs(x - cx) <= PAN_HALF && y <= baseY + 24 && y >= baseY - 150) {
        return side;
      }
    }
    return null;
  }

  function startDrag(e: React.PointerEvent, trayIndex: number) {
    if (disabled || !capabilities.drag) return;
    e.preventDefault();
    const { x, y } = toSvg(e.clientX, e.clientY);
    svgRef.current?.setPointerCapture(e.pointerId);
    setDrag({ trayIndex, item: tray[trayIndex], x, y });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const { x, y } = toSvg(e.clientX, e.clientY);
    setDrag({ ...drag, x, y });
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!drag) return;
    const { x, y } = toSvg(e.clientX, e.clientY);
    const side = zoneAt(x, y);
    if (side) {
      onChange?.({
        state: addToPan(state, side, drag.item),
        tray: tray.filter((_, i) => i !== drag.trayIndex),
      });
    }
    svgRef.current?.releasePointerCapture(e.pointerId);
    setDrag(null);
  }

  function removeBlock(side: Side, index: number) {
    if (disabled || !capabilities.removeUnits) return;
    const item = state[side][index];
    // Only free units are removable: variables and locked given blocks are fixed.
    if (item.kind !== "unit" || item.locked) return;
    // Return the removed block to the tray so it can always be dragged back on.
    onChange?.({
      state: removeFromPan(state, side, index),
      tray: [...tray, item],
    });
  }

  function applySplit() {
    if (disabled) return;
    const next = splitBoth(state, groups);
    if (!next) {
      setSplitMsg(
        "Those groups don't come out even - try removing extra blocks from both sides first.",
      );
      return;
    }
    setSplitMsg(null);
    onChange?.({ state: next, tray });
  }

  function renderPan(side: Side) {
    const end = ends[side];
    const baseY = end.y + STRING;
    const items = state[side];
    return (
      <g>
        {/* string */}
        <line
          x1={end.x}
          y1={end.y}
          x2={end.x}
          y2={baseY}
          stroke="var(--text-muted)"
          strokeWidth={2}
        />
        {/* pan platform - light gray so it reads against the dark background */}
        <rect
          x={end.x - PAN_HALF}
          y={baseY}
          width={PAN_HALF * 2}
          height={8}
          rx={4}
          fill="var(--text-muted)"
        />
        {/* blocks */}
        {items.map((item, i) => {
          const { x, y } = blockPos(i, items.length, end.x, baseY - 3);
          const isVar = item.kind === "var";
          const locked = Boolean(item.locked);
          const tappable =
            capabilities.removeUnits && item.kind === "unit" && !locked;
          // Locked units are muted/gray; free units are blue; variables are mint.
          const fill = locked
            ? "var(--text-muted)"
            : isVar
              ? "var(--brand)"
              : "var(--info)";
          const interactive = Boolean(tappable && !disabled);
          return (
            <g
              key={`${side}-${i}`}
              onClick={() => removeBlock(side, i)}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? "Remove a block from this side" : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        removeBlock(side, i);
                      }
                    }
                  : undefined
              }
              style={{ cursor: interactive ? "pointer" : "default" }}
            >
              {interactive && (
                // Larger transparent hit area for comfortable touch taps.
                <rect
                  x={x - 5}
                  y={y - 5}
                  width={CELL + 10}
                  height={CELL + 10}
                  fill="transparent"
                />
              )}
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={5}
                fill={fill}
                className={
                  tappable && highlight === "blocks" ? "block-pulse" : undefined
                }
                stroke={
                  tappable
                    ? "var(--warn)"
                    : locked
                      ? "var(--border)"
                      : "transparent"
                }
                strokeWidth={tappable || locked ? 2 : 0}
              />
              {isVar && (
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={700}
                  fill="var(--bg)"
                >
                  {item.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  const showSplit = capabilities.split && !disabled;

  return (
    <div className="no-touch-scroll select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="h-auto max-h-[48vh] w-full sm:max-h-[58vh]"
        style={{ touchAction: "none" }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label="Balance scale"
      >
        {/* base + fulcrum - light gray so the stand stands out from the dark bg */}
        <rect x={120} y={296} width={160} height={10} rx={5} fill="var(--text-muted)" />
        <polygon
          points={`${PIVOT.x - 34},296 ${PIVOT.x + 34},296 ${PIVOT.x},${PIVOT.y}`}
          fill="var(--text-muted)"
        />
        {/* beam */}
        <line
          x1={ends.left.x}
          y1={ends.left.y}
          x2={ends.right.x}
          y2={ends.right.y}
          stroke="var(--brand)"
          strokeWidth={9}
          strokeLinecap="round"
          style={{ transition: "all 220ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
        <circle cx={PIVOT.x} cy={PIVOT.y} r={7} fill="var(--brand-strong)" />

        {/* pans (wrapped so the transition animates the tilt smoothly) */}
        <g style={{ transition: "all 220ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
          {renderPan("left")}
          {renderPan("right")}
        </g>

        {/* drag ghost */}
        {drag && (
          <rect
            x={drag.x - CELL / 2}
            y={drag.y - CELL / 2}
            width={CELL}
            height={CELL}
            rx={5}
            fill="var(--info)"
            opacity={0.85}
            pointerEvents="none"
          />
        )}
      </svg>

      {/* drag tray */}
      {capabilities.drag && tray.length > 0 && (
        <div
          className={`mt-2 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 ${
            highlight === "tray" ? "feature-highlight" : ""
          }`}
        >
          <span className="mr-1 text-xs text-muted">Drag blocks:</span>
          {tray.map((item, i) => (
            <button
              key={i}
              onPointerDown={(e) => startDrag(e, i)}
              disabled={disabled}
              aria-label="Unit block, drag onto a pan"
              className="h-9 w-9 rounded-md bg-info shadow-card transition-transform active:scale-90 disabled:opacity-50"
              style={{ touchAction: "none" }}
            />
          ))}
        </div>
      )}

      {/* split control */}
      {showSplit && (
        <div
          className={`mt-2 flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-3 ${
            highlight === "split" ? "feature-highlight" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">Split both sides into</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGroups((g) => Math.max(2, g - 1))}
                className="h-8 w-8 rounded-lg border border-border text-lg leading-none text-ink"
                aria-label="Fewer groups"
              >
                &minus;
              </button>
              <span className="w-6 text-center font-bold">{groups}</span>
              <button
                onClick={() => setGroups((g) => Math.min(8, g + 1))}
                className="h-8 w-8 rounded-lg border border-border text-lg leading-none text-ink"
                aria-label="More groups"
              >
                +
              </button>
            </div>
            <span className="text-sm text-muted">groups</span>
            <button
              onClick={applySplit}
              className="rounded-lg bg-info px-3 py-1.5 text-sm font-semibold text-bg"
            >
              Split
            </button>
          </div>
          {splitMsg && <p className="text-xs text-warn">{splitMsg}</p>}
        </div>
      )}
    </div>
  );
}
