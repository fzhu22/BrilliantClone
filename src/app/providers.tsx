"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ProgressProvider } from "@/lib/progress";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </AuthProvider>
  );
}
