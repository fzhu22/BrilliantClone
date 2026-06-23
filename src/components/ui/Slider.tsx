"use client";

import { useRef } from "react";

// A pointer-driven slider. Native <input type="range"> drags unreliably on
// touch/trackpad (the gesture gets stolen by page scrolling, so you can only
// tap-to-set). This one captures the pointer and sets touch-action: none, so you
// can grab anywhere on the track and drag smoothly on mouse, touch, and pen.

interface Props {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const THUMB = 26; // px - large, easy-to-grab handle

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const range = max - min || 1;
  const fraction = Math.max(0, Math.min(1, (value - min) / range));

  // How many decimals the step implies, so quantized values stay tidy (no 0.30000004).
  const decimals = (() => {
    const s = String(step);
    const dot = s.indexOf(".");
    return dot === -1 ? 0 : s.length - dot - 1;
  })();

  function quantize(raw: number): number {
    const stepped = Math.round((raw - min) / step) * step + min;
    const clamped = Math.max(min, Math.min(max, stepped));
    return Number(clamped.toFixed(decimals));
  }

  function valueFromClientX(clientX: number): number {
    const el = trackRef.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
    return quantize(min + ratio * range);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (disabled) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    const next = valueFromClientX(e.clientX);
    if (next !== value) onChange(next);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || disabled) return;
    const next = valueFromClientX(e.clientX);
    if (next !== value) onChange(next);
  }

  function endDrag(e: React.PointerEvent) {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    let next = value;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = value - step;
        break;
      case "ArrowRight":
      case "ArrowUp":
        next = value + step;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    const q = quantize(next);
    if (q !== value) onChange(q);
  }

  return (
    <div
      className={`no-touch-scroll relative flex h-11 items-center ${
        disabled ? "opacity-50" : "cursor-pointer"
      }`}
      style={{
        paddingLeft: THUMB / 2,
        paddingRight: THUMB / 2,
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div ref={trackRef} className="relative h-2 w-full rounded-full bg-border">
        {/* filled portion up to the thumb */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-brand"
          style={{ width: `${fraction * 100}%` }}
        />
        {/* thumb */}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 rounded-full bg-brand shadow-card outline-none ring-2 ring-bg transition-transform focus-visible:ring-info active:scale-110"
          style={{
            width: THUMB,
            height: THUMB,
            left: `${fraction * 100}%`,
            transform: "translate(-50%, -50%)",
            touchAction: "none",
          }}
        />
      </div>
    </div>
  );
}
