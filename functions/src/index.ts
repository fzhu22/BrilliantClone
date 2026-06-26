import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";

// The OpenAI key lives only here, as a Cloud Function secret. Set it once with:
//   firebase functions:secrets:set OPENAI_API_KEY
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// Small, current model with strict Structured Outputs support. Swap for
// gpt-4.1-nano (cheaper) or gpt-5-mini / gpt-5.5 (higher quality) as needed.
const OPENAI_MODEL = "gpt-4.1-mini";

// --- Request/response shapes (mirror src/lib/ai/types.ts on the client) ---

interface ProblemContext {
  lessonId: string;
  lessonTitle: string;
  stepIndex: number;
  prompt: string;
  interaction: string;
  goal: string;
}

interface AttemptContext {
  mistake?: string;
  learnerState: string;
  attemptNumber: number;
  priorMistakes: string[];
  authoredHint?: string;
}

/** One problem's solve history, used to judge mastery. */
interface MasteryProblem {
  prompt: string;
  interaction: string;
  attempts: number;
  solvedFirstTry: boolean;
  mistakes: string[];
}

interface MasterySummary {
  lessonTitle: string;
  problems: MasteryProblem[];
}

type TutorRequest =
  | { kind: "hint"; problem: ProblemContext; attempt: AttemptContext }
  | { kind: "mastery"; lesson: MasterySummary };

// --- Prompts (kept server-side so they are never shipped to the browser) ---

const HINT_SYSTEM = `You are Sage, a warm, encouraging math tutor for students aged 11-14 learning algebra on an interactive balance-scale and graphing app.
Give exactly ONE short hint (at most 2 sentences) tailored to the SPECIFIC mistake the learner just made.
Nudge them toward the next move; do NOT state the final answer or the exact sequence of taps. Use plain, friendly language and no jargon.`;

const MASTERY_SYSTEM = `You are Sage, a supportive but honest math tutor for students aged 11-14.
You are given how a learner solved every problem in a lesson: attempts, the mistakes they made, and whether they got each one right on the first try.
Judge how well they have MASTERED the lesson's concepts. Reward consistent first-try success; weigh down repeated wrong attempts and the same mistake recurring.
Return masteryPercent (0-100) for how much of the content they have truly mastered, mastered (true only for strong, consistent performance - roughly 80% or higher), and a warm 1-2 sentence summary for the learner that names what they did well and what to review.`;

// --- Structured Outputs schemas (strict: all props required, no extras) ---

const HINT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["hint", "conceptTag"],
  properties: {
    hint: {
      type: "string",
      description: "One short hint (max 2 sentences). Never reveal the answer.",
    },
    // Nullable rather than optional: strict mode requires every key to be present.
    conceptTag: {
      type: ["string", "null"],
      description: "A 2-4 word label for the concept, e.g. 'keep both sides equal'.",
    },
  },
};

const MASTERY_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["masteryPercent", "mastered", "summary"],
  properties: {
    masteryPercent: {
      type: "integer",
      description: "0-100: how much of the lesson's content the learner has mastered.",
    },
    mastered: {
      type: "boolean",
      description: "True only for strong, consistent mastery (roughly 80%+).",
    },
    summary: {
      type: "string",
      description: "1-2 warm sentences for the learner: what they did well + what to review.",
    },
  },
};

function hintPrompt(problem: ProblemContext, attempt: AttemptContext): string {
  return [
    `Problem (${problem.interaction}): ${problem.prompt}`,
    `Goal (reference only - never reveal to the learner): ${problem.goal}`,
    `What the learner has on screen now: ${attempt.learnerState}`,
    `Their specific mistake: ${attempt.mistake ?? "unclear"}`,
    `Wrong attempts so far on this problem: ${attempt.attemptNumber}`,
    `Earlier mistakes this problem: ${attempt.priorMistakes.join(", ") || "none"}`,
    `Authored fallback hint (you may rephrase or improve on it): ${
      attempt.authoredHint ?? "none"
    }`,
    "",
    "Write one short, specific hint for this exact mistake.",
  ].join("\n");
}

function masteryPrompt(lesson: MasterySummary): string {
  const lines = lesson.problems.map((p, i) => {
    return `${i + 1}. "${p.prompt}" [${p.interaction}] - attempts: ${p.attempts}, first try: ${
      p.solvedFirstTry ? "yes" : "no"
    }, mistakes: ${p.mistakes.join(", ") || "none"}`;
  });
  return [
    `Lesson: ${lesson.lessonTitle}`,
    `Here is how the learner solved each of the ${lesson.problems.length} problems:`,
    ...lines,
    "",
    "Judge how well they have mastered this lesson.",
  ].join("\n");
}

/** Picks the system prompt, user prompt, schema, name, and temperature. */
function configFor(req: TutorRequest): {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  name: string;
  temperature: number;
} {
  if (req.kind === "mastery") {
    return {
      system: MASTERY_SYSTEM,
      user: masteryPrompt(req.lesson),
      schema: MASTERY_SCHEMA,
      name: "tutor_mastery",
      temperature: 0.2,
    };
  }
  return {
    system: HINT_SYSTEM,
    user: hintPrompt(req.problem, req.attempt),
    schema: HINT_SCHEMA,
    name: "tutor_hint",
    temperature: 0.4,
  };
}

function isValidRequest(data: unknown): data is TutorRequest {
  if (!data || typeof data !== "object") return false;
  const d = data as { kind?: unknown; problem?: unknown; attempt?: unknown; lesson?: unknown };
  if (d.kind === "hint") {
    return typeof d.problem === "object" && d.problem !== null && typeof d.attempt === "object" && d.attempt !== null;
  }
  if (d.kind === "mastery") {
    return (
      typeof d.lesson === "object" &&
      d.lesson !== null &&
      Array.isArray((d.lesson as MasterySummary).problems)
    );
  }
  return false;
}

/**
 * Callable tutor proxy. Requires an authenticated caller, calls OpenAI with the
 * secret key, and returns schema-validated JSON: { hint, conceptTag } for a hint,
 * or { masteryPercent, mastered, summary } for a mastery assessment. The client
 * treats any thrown error as "no AI result" and falls back gracefully.
 */
export const tutor = onCall(
  {
    secrets: [OPENAI_API_KEY],
    region: "us-central1",
    // Allow the browser to reach the callable (in-code auth still applies).
    invoker: "public",
    // Flip to true once App Check (reCAPTCHA Enterprise) is configured.
    enforceAppCheck: false,
    maxInstances: 10,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in to use the AI tutor.");
    }
    if (!isValidRequest(request.data)) {
      throw new HttpsError("invalid-argument", "Malformed tutor request.");
    }

    const cfg = configFor(request.data);
    const client = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

    try {
      const completion = await client.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: cfg.temperature,
        max_tokens: 320,
        messages: [
          { role: "system", content: cfg.system },
          { role: "user", content: cfg.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: cfg.name, strict: true, schema: cfg.schema },
        },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new HttpsError("internal", "Empty response from the model.");
      }
      return JSON.parse(content);
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      throw new HttpsError("internal", "The AI tutor request failed.");
    }
  },
);
