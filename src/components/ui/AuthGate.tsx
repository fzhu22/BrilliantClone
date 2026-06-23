"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SetupNotice } from "./SetupNotice";
import { Spinner } from "./Spinner";

/** Wraps pages that require a signed-in learner. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (configured && !loading && !user) {
      router.replace("/login");
    }
  }, [configured, loading, user, router]);

  if (!configured) return <SetupNotice />;
  if (loading) return <Spinner />;
  if (!user) return null;
  return <>{children}</>;
}
