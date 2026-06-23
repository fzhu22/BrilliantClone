"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import { useAuth } from "./auth";
import { rollStreak, todayKey, type Streak } from "./streak";

export interface LessonProgress {
  completed?: boolean;
  currentStepIndex?: number;
  attempts?: number;
  /** Best-so-far share of problems solved on the first try (0..1). */
  accuracy?: number;
  /** True once accuracy reaches the mastery threshold. */
  mastered?: boolean;
  updatedAt?: number;
}

export interface AnswerEvent {
  lessonId: string;
  stepIndex: number;
  correct: boolean;
  mistake?: string;
  at: number;
}

export interface ProgressDoc {
  name?: string;
  streak?: Streak;
  points?: number;
  /** Keys of things already awarded points, so replays don't farm points. */
  awarded?: string[];
  lessons?: Record<string, LessonProgress>;
  history?: AnswerEvent[];
}

/** Points awarded for a correct problem and for finishing a lesson. */
export const POINTS_PER_PROBLEM = 10;
export const POINTS_PER_LESSON = 25;

/** Share of first-try-correct problems needed to "master" a lesson. */
export const MASTERY_THRESHOLD = 0.8;

/** A transient award event used to trigger the on-screen points animation. */
export interface PointsBurst {
  id: number;
  amount: number;
}

interface ProgressContextValue {
  progress: ProgressDoc;
  loading: boolean;
  points: number;
  burst: PointsBurst | null;
  saveStep: (lessonId: string, stepIndex: number) => void;
  recordAttempt: (
    lessonId: string,
    stepIndex: number,
    correct: boolean,
    mistake?: string,
  ) => void;
  completeLesson: (lessonId: string, sessionAccuracy: number) => void;
  /** Awards points for `key` only the first time (no farming via replays). */
  awardPointsOnce: (key: string, amount: number) => void;
  clearBurst: () => void;
  /** Incrementing token; bump it to play the green correct-answer glow. */
  correctFlashId: number;
  flashCorrect: () => void;
  resetProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

const HISTORY_CAP = 50;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressDoc>({});
  const [loading, setLoading] = useState(true);
  const [burst, setBurst] = useState<PointsBurst | null>(null);
  const [correctFlashId, setCorrectFlashId] = useState(0);

  // Mirror of the latest progress for read-modify-write without stale closures.
  const latest = useRef<ProgressDoc>({});
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latest.current = progress;
  }, [progress]);

  useEffect(() => {
    const db = getDb();
    if (!user || !db) {
      setProgress({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(db, "users", user.uid);
    // onSnapshot serves the cached value instantly (offline persistence) and
    // keeps every device in sync.
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProgress(snap.exists() ? (snap.data() as ProgressDoc) : {});
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [user]);

  function write(partial: Partial<ProgressDoc>) {
    const db = getDb();
    if (!user || !db) return;
    const ref = doc(db, "users", user.uid);
    void setDoc(
      ref,
      { name: user.displayName ?? undefined, ...partial },
      { merge: true },
    );
  }

  function nextStreak(): Streak {
    return rollStreak(latest.current.streak, todayKey());
  }

  function saveStep(lessonId: string, stepIndex: number) {
    // Optimistic local update so the UI never waits on the network.
    setProgress((p) => ({
      ...p,
      lessons: {
        ...p.lessons,
        [lessonId]: { ...p.lessons?.[lessonId], currentStepIndex: stepIndex },
      },
    }));
    // Debounce the network write so rapid step changes coalesce.
    if (stepTimer.current) clearTimeout(stepTimer.current);
    stepTimer.current = setTimeout(() => {
      write({
        streak: nextStreak(),
        lessons: {
          [lessonId]: { currentStepIndex: stepIndex, updatedAt: Date.now() },
        },
      });
    }, 400);
  }

  function recordAttempt(
    lessonId: string,
    stepIndex: number,
    correct: boolean,
    mistake?: string,
  ) {
    const prev = latest.current.lessons?.[lessonId];
    const attempts = (prev?.attempts ?? 0) + 1;
    const event: AnswerEvent = { lessonId, stepIndex, correct, mistake, at: Date.now() };
    const history = [...(latest.current.history ?? []), event].slice(-HISTORY_CAP);
    write({ lessons: { [lessonId]: { attempts } }, history });
  }

  function completeLesson(lessonId: string, sessionAccuracy: number) {
    const prev = latest.current.lessons?.[lessonId];
    // Keep the best accuracy across attempts so replays can raise mastery.
    const accuracy = Math.max(prev?.accuracy ?? 0, sessionAccuracy);
    const mastered = accuracy >= MASTERY_THRESHOLD;
    setProgress((p) => ({
      ...p,
      lessons: {
        ...p.lessons,
        [lessonId]: { ...p.lessons?.[lessonId], completed: true, accuracy, mastered },
      },
    }));
    write({
      streak: nextStreak(),
      lessons: {
        [lessonId]: { completed: true, accuracy, mastered, updatedAt: Date.now() },
      },
    });
  }

  function awardPointsOnce(key: string, amount: number) {
    if (amount <= 0) return;
    const awarded = latest.current.awarded ?? [];
    if (awarded.includes(key)) return; // already earned for this problem/lesson
    const newAwarded = [...awarded, key];
    const newTotal = (latest.current.points ?? 0) + amount;
    setProgress((p) => ({ ...p, points: newTotal, awarded: newAwarded }));
    setBurst({ id: Date.now() + Math.random(), amount });
    write({ points: newTotal, awarded: newAwarded });
  }

  function clearBurst() {
    setBurst(null);
  }

  function flashCorrect() {
    setCorrectFlashId((id) => id + 1);
  }

  async function resetProgress() {
    const db = getDb();
    if (!user || !db) return;
    if (stepTimer.current) clearTimeout(stepTimer.current);
    setProgress({ name: user.displayName ?? undefined });
    const ref = doc(db, "users", user.uid);
    // merge:false overwrites the whole document, erasing lessons/streak/history.
    await setDoc(ref, { name: user.displayName ?? undefined }, { merge: false });
  }

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loading,
        points: progress.points ?? 0,
        burst,
        saveStep,
        recordAttempt,
        completeLesson,
        awardPointsOnce,
        clearBurst,
        correctFlashId,
        flashCorrect,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
