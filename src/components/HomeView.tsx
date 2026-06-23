"use client";

import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui/Spinner";
import { Landing } from "./Landing";
import { CourseDashboard } from "./CourseDashboard";

export function HomeView() {
  const { user, loading, configured } = useAuth();

  // Wait for auth to resolve before deciding which view to show.
  if (configured && loading) return <Spinner label="Loading" />;

  // Signed-in learners get the course; everyone else gets the landing page.
  return user ? <CourseDashboard /> : <Landing />;
}
