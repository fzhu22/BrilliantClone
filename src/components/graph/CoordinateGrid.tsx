"use client";

// Responsive SVG coordinate grid. Draws a 4-quadrant plane, an optional dashed
// target line, and the learner's current line from y = mx + b. Pure rendering,
// so it stays smooth as the sliders move.

const VB = 360; // square viewBox
const PAD = 20;
const SPAN = VB - PAD * 2;

interface Props {
  /** Axis range shown in each direction, e.g. 6 means -6..6. */
  range?: number;
  /** Learner's current line. */
  m: number;
  b: number;
  /** Optional dashed target line to match. */
  target?: { m: number; b: number };
  /** Hide the target (e.g. on a concept illustration). */
  showTarget?: boolean;
}

export function CoordinateGrid({
  range = 6,
  m,
  b,
  target,
  showTarget = true,
}: Props) {
  // Map graph coords -> SVG coords.
  const unit = SPAN / (range * 2);
  const sx = (x: number) => PAD + (x + range) * unit;
  const sy = (y: number) => PAD + (range - y) * unit;

  // Clip a line y = mx + c to the visible box and return its two endpoints.
  function lineEnds(slope: number, intercept: number) {
    // Evaluate at the left/right edges, then clamp y into range so steep lines
    // don't shoot off the canvas.
    const pts: Array<{ x: number; y: number }> = [];
    const yAtLeft = slope * -range + intercept;
    const yAtRight = slope * range + intercept;
    pts.push({ x: -range, y: yAtLeft }, { x: range, y: yAtRight });
    return pts;
  }

  const ticks: number[] = [];
  for (let i = -range; i <= range; i++) ticks.push(i);

  const learner = lineEnds(m, b);
  const tgt = target ? lineEnds(target.m, target.b) : null;

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      className="mx-auto h-auto w-full max-w-sm"
      role="img"
      aria-label={`Coordinate grid showing the line y = ${m}x + ${b}`}
    >
      {/* gridlines */}
      {ticks.map((t) => (
        <g key={`g${t}`}>
          <line
            x1={sx(t)}
            y1={sy(-range)}
            x2={sx(t)}
            y2={sy(range)}
            stroke="var(--border)"
            strokeWidth={t === 0 ? 0 : 1}
            opacity={0.5}
          />
          <line
            x1={sx(-range)}
            y1={sy(t)}
            x2={sx(range)}
            y2={sy(t)}
            stroke="var(--border)"
            strokeWidth={t === 0 ? 0 : 1}
            opacity={0.5}
          />
        </g>
      ))}

      {/* axes */}
      <line x1={sx(-range)} y1={sy(0)} x2={sx(range)} y2={sy(0)} stroke="var(--text-muted)" strokeWidth={2} />
      <line x1={sx(0)} y1={sy(-range)} x2={sx(0)} y2={sy(range)} stroke="var(--text-muted)" strokeWidth={2} />

      {/* target line (dashed) */}
      {tgt && showTarget && (
        <line
          x1={sx(tgt[0].x)}
          y1={sy(tgt[0].y)}
          x2={sx(tgt[1].x)}
          y2={sy(tgt[1].y)}
          stroke="var(--warn)"
          strokeWidth={3}
          strokeDasharray="7 6"
          strokeLinecap="round"
          opacity={0.9}
        />
      )}

      {/* learner line */}
      <line
        x1={sx(learner[0].x)}
        y1={sy(learner[0].y)}
        x2={sx(learner[1].x)}
        y2={sy(learner[1].y)}
        stroke="var(--brand)"
        strokeWidth={3.5}
        strokeLinecap="round"
        style={{ transition: "all 120ms ease-out" }}
      />

      {/* y-intercept marker on the learner line */}
      {Math.abs(b) <= range && (
        <circle cx={sx(0)} cy={sy(b)} r={5} fill="var(--brand)" />
      )}
    </svg>
  );
}
