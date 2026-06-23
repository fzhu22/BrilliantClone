import type { Lesson, LessonMeta } from "./types";
import { lesson1 } from "./lessons/lesson1";
import { lesson2 } from "./lessons/lesson2";
import { lesson3 } from "./lessons/lesson3";

export const course = {
  id: "algebra-balance",
  title: "Algebra: The Balance",
  bigConcept:
    "An equation is a balance. You solve it by keeping both sides equal.",
};

/** Ordered course path: See it -> Keep it -> Use it. */
export const lessons: Lesson[] = [lesson1, lesson2, lesson3];

export const lessonOrder: string[] = lessons.map((l) => l.id);

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function lessonMeta(): LessonMeta[] {
  return lessons.map(({ id, title, tag, subtitle }) => ({
    id,
    title,
    tag,
    subtitle,
  }));
}

export function lessonIndex(id: string): number {
  return lessonOrder.indexOf(id);
}

/** The next lesson in the path, or undefined if this is the last one. */
export function getNextLessonId(id: string): string | undefined {
  const i = lessonIndex(id);
  if (i < 0 || i >= lessonOrder.length - 1) return undefined;
  return lessonOrder[i + 1];
}

/** Total problem steps in a lesson (used for progress + mastery signals). */
export function problemCount(lesson: Lesson): number {
  return lesson.steps.filter((s) => s.type === "problem").length;
}
