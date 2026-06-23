"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useProgress } from "@/lib/progress";

export function CorrectFlash() {
  const { correctFlashId } = useProgress();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (correctFlashId === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [correctFlashId]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div key={correctFlashId} className="correct-flash" aria-hidden />,
    document.body,
  );
}
