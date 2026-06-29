import type { Lesson, LessonMeta, ProblemStep, SkillId } from "./types";
import { lessonEqualSign } from "./lessons/lessonEqualSign";
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

/** Ordered course path, easiest to hardest. The equals-sign check comes first:
 *  it targets algebra's most predictive misconception and gates the rest. */
export const lessons: Lesson[] = [
  lessonEqualSign,
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  lesson5,
];

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

/** A problem plus the lesson identity the runners need (e.g. for AI hints). */
export interface ProblemRef {
  lessonId: string;
  lessonTitle: string;
  stepIndex: number;
  step: ProblemStep;
}

/** Every problem step across the course, tagged with its lesson identity. */
export function allProblemSteps(): ProblemRef[] {
  const out: ProblemRef[] = [];
  for (const l of lessons) {
    l.steps.forEach((step, stepIndex) => {
      if (step.type === "problem") {
        out.push({ lessonId: l.id, lessonTitle: l.title, stepIndex, step });
      }
    });
  }
  return out;
}

/** Problems grouped by the skill they train (used to build review sessions). */
export function problemsBySkill(): Partial<Record<SkillId, ProblemRef[]>> {
  const map: Partial<Record<SkillId, ProblemRef[]>> = {};
  for (const ref of allProblemSteps()) {
    (map[ref.step.skill] ??= []).push(ref);
  }
  return map;
}

/** The distinct skills a lesson trains, in first-appearance order. */
export function lessonSkills(lessonId: string): SkillId[] {
  const lesson = getLesson(lessonId);
  if (!lesson) return [];
  const seen = new Set<SkillId>();
  const out: SkillId[] = [];
  for (const step of lesson.steps) {
    if (step.type === "problem" && !seen.has(step.skill)) {
      seen.add(step.skill);
      out.push(step.skill);
    }
  }
  return out;
}
