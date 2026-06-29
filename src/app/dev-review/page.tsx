import { Header } from "@/components/ui/Header";
import { ReviewPlayer } from "@/components/review/ReviewPlayer";

// Dev/testing route: triggers a full mixed review across every topic on demand,
// ignoring the spaced schedule. Reuses the normal review UI + mastery updates.
export default function DevReviewPage() {
  return (
    <>
      <Header />
      <ReviewPlayer dev />
    </>
  );
}
