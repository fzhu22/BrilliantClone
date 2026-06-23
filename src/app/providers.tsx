"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ProgressProvider } from "@/lib/progress";
import { PointsBurst } from "@/components/ui/PointsBurst";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProgressProvider>
        {children}
        <PointsBurst />
      </ProgressProvider>
    </AuthProvider>
  );
}
