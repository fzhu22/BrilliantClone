"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useProgress } from "@/lib/progress";

export function PointsBurst() {
  const { burst, clearBurst } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => clearBurst(), 1200);
    return () => clearTimeout(t);
  }, [burst, clearBurst]);

  if (!mounted || !burst) return null;

  return createPortal(
    <div key={burst.id} className="points-burst" aria-hidden>
      <div className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-2xl font-extrabold text-bg shadow-card">
        <span>+{burst.amount}</span>
        <span>&#11088;</span>
      </div>
    </div>,
    document.body,
  );
}
