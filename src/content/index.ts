import type { Lesson, LessonMeta } from "./types";
import { lesson1 } from "./lessons/lesson1";
import { lesson2 } from "./lessons/lesson2";
import { lesson3 } from "./lessons/lesson3";
import { lesson4 } from "./lessons/lesson4";
import { lesson5 } from "./lessons/lesson5";

export const course = {
  id: "algebra-balance",
  title: "Algebra: Balance to Lines",
  bigConcept:
    "An equation is a balance you solve by keeping both sides equal - and a line is just an equation you can see.",
};

/** Ordered course path, easiest to hardest. */
export const lessons: Lesson[] = [lesson1, lesson2, lesson3, lesson4, lesson5];

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
