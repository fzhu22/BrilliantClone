import { Header } from "@/components/ui/Header";
import { StartLearningButton } from "@/components/StartLearningButton";
import { CoursePath } from "@/components/CoursePath";
import { course } from "@/content";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-2xl flex-col px-6 py-12">
        <div className="text-center">
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
            Learn algebra by doing
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl">
            Every equation is a <span className="text-brand">balance</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted">
            {course.bigConcept} No videos, no walls of text&mdash;you learn by doing.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <StartLearningButton />
          </div>
        </div>

        <section className="mt-14">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Your path
          </h2>
          <CoursePath />
        </section>
      </main>
    </>
  );
}
