import { notFound } from "next/navigation";
import { getLesson, lessonOrder } from "@/content";
import { Header } from "@/components/ui/Header";
import { AuthGate } from "@/components/ui/AuthGate";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

// Pre-render one static page per lesson for the static export.
export function generateStaticParams() {
  return lessonOrder.map((lessonId) => ({ lessonId }));
}

export default function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const lesson = getLesson(params.lessonId);
  if (!lesson) notFound();

  return (
    <>
      <Header />
      <AuthGate>
        <LessonPlayer lesson={lesson} />
      </AuthGate>
    </>
  );
}
