import "server-only";
import { extractJson, type ChatMessage } from "@/lib/groq";
import type { StudentProfile } from "@/types/profile";
import type { AssessmentItemPublic, AssessmentDimension } from "@/types/assessment";

const STREAM_LABELS: Record<string, string> = {
  science_bio: "Science (Biology)",
  science_maths: "Science (Maths)",
  science_cs: "Science (Computer Science)",
  commerce: "Commerce",
  humanities: "Humanities / Arts",
};

// Bump when the question-generation prompt changes so previously cached items
// (stored per session) are regenerated instead of served stale.
export const ASSESSMENT_GEN_VERSION = 7;

export type AiItem = {
  id: string;
  dimension: string;
  questionText: string;
  // correctId is server-only for aptitude items — stripped before sending to client.
  correctId?: string;
  // interestCluster is server-only metadata on personality items — stripped before
  // sending to the client so it can't influence the student's choice.
  choices: { id: string; text: string; interestCluster?: string }[];
};

export async function generateAiAssessmentItems(
  profile: Partial<StudentProfile> | null,
  allowedClusters?: string[],
): Promise<AiItem[]> {
  const stream = profile?.academic?.stream;
  const streamLabel = stream ? (STREAM_LABELS[stream] ?? stream) : "Plus Two";
  const subjects = profile?.academic?.strongSubjects ?? [];
  const interests = Object.entries(profile?.interests ?? {})
    .filter(([, v]) => (v ?? 0) >= 0.2)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 3)
    .map(([k]) => k);
  const goal = profile?.aspiration?.goalOrientation ?? "";
  const priorities = profile?.aspiration?.careerPriorities ?? [];
  const goalLabels: Record<string, string> = {
    higher_study: "pursue a degree",
    job_soon: "get a job quickly",
    business: "start a business",
    government: "prepare for govt exams",
  };

  const lockedClusters = allowedClusters?.length
    ? allowedClusters.join(", ")
    : "health_medicine, technology_coding, business_money, science_research, design_visual, helping_teaching, law_justice, building_engineering, media_communication, nature_agriculture, defence_adventure, numbers_analysis";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You generate personalised MCQ assessment questions for a career guidance app used by Plus Two students (age 16–18) in Kerala, India. " +
        "Use simple, everyday English a 16-year-old easily understands — short sentences, no jargon or complicated words. " +
        "Return only valid JSON — no extra text.",
    },
    {
      role: "user",
      content:
        `Generate exactly 7 multiple-choice questions to assess this Kerala Plus Two student.\n\n` +
        `Student profile:\n` +
        `- Stream: ${streamLabel}\n` +
        `- Strong subjects: ${subjects.length ? subjects.join(", ") : "not specified"}\n` +
        `- Primary interests: ${interests.length ? interests.join(", ") : "not specified"}\n` +
        `- Goal after Plus Two: ${goalLabels[goal] || goal || "not specified"}\n` +
        (priorities.length ? `- Career priorities: ${priorities.join(", ")}\n` : ``) +
        `\n` +
        `LANGUAGE: Simple everyday English for a 16-year-old. Short sentences, common words, no jargon.\n\n` +
        `SECTION 1 — Aptitude (ai_1, ai_2, ai_3): test real ability, SCORED right/wrong.\n` +
        `- ai_1: numerical — a real calculation (percentage, ratio, average, simple money/marks problem).\n` +
        `- ai_2: logical — a self-contained reasoning or number/letter sequence puzzle.\n` +
        `- ai_3: scientific — apply one basic science fact from their stream to a simple everyday situation.\n` +
        `- CRITICAL: every question must be fully solvable from words alone. Never refer to a picture,\n` +
        `  diagram, chart, or "the figure above" — there are no images.\n` +
        `- Exactly ONE choice is correct; the other three must be clearly wrong. Include "correctId".\n` +
        `- Keep numbers small and wording simple. Personalise context to their stream and subjects.\n` +
        `- Place the correct answer in any position (a/b/c/d) — vary it across the 3 questions.\n` +
        `- Aptitude choice format: { "id": "a", "text": "..." }  — no interestCluster field.\n\n` +
        `SECTION 2 — Interest confirmation (ai_4, ai_5, ai_6, ai_7): NOT scored — confirm primary interest.\n` +
        `- These 4 questions confirm the student's main direction. Every choice value MUST be one of:\n` +
        `  ${lockedClusters}\n` +
        `- Each question must use a DIFFERENT framing. Examples (write your own — do not copy these):\n` +
        `  "Which project would you happily spend a weekend on?"\n` +
        `  "Which problem would you most enjoy solving?"\n` +
        `  "Which class would you never skip?"\n` +
        `  "Which task would feel easiest to stick with for hours?"\n` +
        `- Each choice is a COMPLETE concrete activity (4–9 words) — something you DO, not a job title.\n` +
        `- All 4 choices per question must answer the same question and be clearly different from each other.\n` +
        `- dimension MUST be exactly "interest_personality" for all 4.\n` +
        `- Choice format: { "id": "a", "text": "...", "interestCluster": "<one of the locked clusters above>" }\n\n` +
        `Return this exact JSON shape (no markdown, no extra keys):\n` +
        `{ "items": [\n` +
        `  { "id": "ai_1", "dimension": "numerical", "questionText": "...", "correctId": "b", "choices": [{ "id": "a", "text": "..." }, ...] },\n` +
        `  { "id": "ai_2", "dimension": "logical", "questionText": "...", "correctId": "a", "choices": [...] },\n` +
        `  { "id": "ai_3", "dimension": "scientific", "questionText": "...", "correctId": "c", "choices": [...] },\n` +
        `  { "id": "ai_4", "dimension": "interest_personality", "questionText": "...", "choices": [{ "id": "a", "text": "...", "interestCluster": "health_medicine" }, ...] },\n` +
        `  { "id": "ai_5", "dimension": "interest_personality", "questionText": "...", "choices": [...] },\n` +
        `  { "id": "ai_6", "dimension": "interest_personality", "questionText": "...", "choices": [...] },\n` +
        `  { "id": "ai_7", "dimension": "interest_personality", "questionText": "...", "choices": [...] }\n` +
        `] }`,
    },
  ];

  const { data } = await extractJson<{ items: AiItem[] }>(messages, { temperature: 0.7 });
  const items = data?.items;
  if (!Array.isArray(items) || items.length < 6) throw new Error("AI returned too few items");

  return items.slice(0, 7).map((item, i) => ({ ...item, id: `ai_${i + 1}` }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function toPublicItems(aiItems: AiItem[]): AssessmentItemPublic[] {
  return aiItems.map((item) => ({
    id: item.id,
    dimension: item.dimension as AssessmentDimension,
    questionText: item.questionText,
    choices: shuffleArray(item.choices).map((c) => ({ id: c.id, text: c.text })),
  }));
}

