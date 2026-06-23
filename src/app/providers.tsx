"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ProgressProvider } from "@/lib/progress";
import { PointsBurst } from "@/components/ui/PointsBurst";
import { CorrectFlash } from "@/components/ui/CorrectFlash";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProgressProvider>
        {children}
        <PointsBurst />
        <CorrectFlash />
      </ProgressProvider>
    </AuthProvider>
  );
}
