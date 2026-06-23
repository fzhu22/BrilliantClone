"use client";

/**
 * "Sage" - a friendly green tutor in the spirit of Brilliant's Koji. Lightweight
 * inline SVG so it scales cleanly and animates without any image assets.
 * Animations honor prefers-reduced-motion (see globals.css).
 */
export function Mascot({
  size = 60,
  speaking = false,
}: {
  size?: number;
  speaking?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Sage, your guide"
      className={speaking ? "mascot-bob mascot-speaking" : "mascot-bob"}
    >
      {/* soft glow */}
      <circle cx="32" cy="34" r="30" fill="#34d399" opacity="0.14" />

      {/* sprout on top */}
      <path
        d="M32 16 C32 9 30 5 26 3 C30 4 33 7 33 12"
        fill="#1f9d6b"
      />
      <path
        d="M32 15 C32 8 35 4 40 3 C36 5 34 9 34 14"
        fill="#3ddc8f"
      />

      {/* body */}
      <rect
        x="11"
        y="17"
        width="42"
        height="40"
        rx="19"
        fill="#2fbf86"
        stroke="#1f9d6b"
        strokeWidth="2.5"
      />
      {/* belly highlight */}
      <ellipse cx="32" cy="42" rx="15" ry="12" fill="#46d199" opacity="0.55" />

      {/* eyes (blink via CSS scaleY) */}
      <g className="mascot-eyes">
        <circle cx="24" cy="34" r="7" fill="#ffffff" />
        <circle cx="40" cy="34" r="7" fill="#ffffff" />
        <circle cx="25" cy="35" r="3.4" fill="#15321f" />
        <circle cx="41" cy="35" r="3.4" fill="#15321f" />
        <circle cx="23.6" cy="33.4" r="1.2" fill="#ffffff" />
        <circle cx="39.6" cy="33.4" r="1.2" fill="#ffffff" />
      </g>

      {/* cheeks */}
      <circle cx="18" cy="42" r="2.6" fill="#ffffff" opacity="0.3" />
      <circle cx="46" cy="42" r="2.6" fill="#ffffff" opacity="0.3" />

      {/* smile */}
      <path
        d="M27 44 Q32 49 37 44"
        fill="none"
        stroke="#15321f"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
