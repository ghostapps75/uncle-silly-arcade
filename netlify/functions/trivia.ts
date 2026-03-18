import { Context } from '@netlify/functions';
import { z } from 'zod';
import { validateRequest, jsonResponse, errorResponse, parseBody } from './lib/utils';
import { callOpenAI } from './lib/openai';
// Static import — esbuild bundles the JSON in, no runtime file-path issues
// @ts-ignore
import triviaDb from './data/triviaQuestions.json';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type AgeGroup = '4-6' | '7-9' | '10-12' | '13+';
type Category = 'ANIMALS' | 'SPACE' | 'MOVIES' | 'SPORTS' | 'RANDOM';

interface TriviaQuestion {
    id: string;
    ageGroup: AgeGroup;
    category: string;
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
    hint: string;
}

// ─────────────────────────────────────────
// Request Schema
// ─────────────────────────────────────────

const TriviaRequestSchema = z.object({
    category: z.enum(['ANIMALS', 'SPACE', 'MOVIES', 'SPORTS', 'RANDOM']),
    difficulty: z.number().min(0).max(10),
    ageGroup: z.enum(['4-6', '7-9', '10-12', '13+']).optional(),
    useLocalDb: z.boolean().optional().default(false),
    recentQuestions: z.array(z.string()).optional().default([]),
});

// ─────────────────────────────────────────
// AI Response Schema
// ─────────────────────────────────────────

const TriviaResponseSchema = z.object({
    question: z.string(),
    choices: z.array(z.string()).length(4),
    correctIndex: z.preprocess((val: any) => val, z.union([z.string(), z.number()]).transform(val => {
        const num = Number(val);
        return isNaN(num) ? 0 : Math.min(3, Math.max(0, Math.floor(num)));
    })),
    explanation: z.string().optional(),
    hint: z.string().optional(),
});

const RobustTriviaResponseSchema = z.preprocess((raw: any) => {
    if (typeof raw !== 'object' || !raw) return raw;
    if (raw.correctIndex === undefined) {
        if (raw.answerIndex !== undefined) raw.correctIndex = raw.answerIndex;
        else if (raw.correctAnswerIndex !== undefined) raw.correctIndex = raw.correctAnswerIndex;
        else raw.correctIndex = 0;
    }
    return raw;
}, TriviaResponseSchema);

// ─────────────────────────────────────────
// Local Database Helpers
// ─────────────────────────────────────────

const allQuestions: TriviaQuestion[] = (triviaDb as any).questions ?? [];


/**
 * Map a difficulty score (0-10) to an age group.
 * 0-2  → 4-6
 * 3-5  → 7-9
 * 6-8  → 10-12
 * 9-10 → 13+
 */
function difficultyToAgeGroup(difficulty: number): AgeGroup {
    if (difficulty <= 2) return '4-6';
    if (difficulty <= 5) return '7-9';
    if (difficulty <= 8) return '10-12';
    return '13+';
}

function getLocalQuestion(ageGroup: AgeGroup, category: Category): TriviaQuestion | null {
    if (allQuestions.length === 0) return null;

    // Try exact match: age + category
    let pool = allQuestions.filter(q =>
        q.ageGroup === ageGroup && (category === 'RANDOM' || q.category === category)
    );

    // Fallback: just age group
    if (pool.length === 0) {
        pool = allQuestions.filter(q => q.ageGroup === ageGroup);
    }

    // Fallback: fully random
    if (pool.length === 0) {
        pool = allQuestions;
    }

    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
}

// ─────────────────────────────────────────
// Handler
// ─────────────────────────────────────────

export default async (req: Request, context: Context) => {
    const authError = await validateRequest(req, context);
    if (authError) return authError;

    if (req.method !== 'POST') return errorResponse('Method Not Allowed', 405);

    const body = await parseBody(req, TriviaRequestSchema);
    if (!body) {
        if (process.env.DEBUG_LLM) console.log("Trivia 400 - Body failed parsing:", req.body);
        return errorResponse("Invalid body: Category or Difficulty missing/invalid");
    }

    const { category, difficulty, ageGroup: explicitAgeGroup, useLocalDb, recentQuestions } = body;

    // Determine age group: explicit override > derived from difficulty score
    const ageGroup: AgeGroup = explicitAgeGroup ?? difficultyToAgeGroup(difficulty);

    // ── Strategy 1: Local DB (when useLocalDb=true) ──
    if (useLocalDb) {
        const q = getLocalQuestion(ageGroup, category);
        if (q) {
            return jsonResponse({
                question: q.question,
                choices: q.choices,
                correctIndex: q.correctIndex,
                explanation: q.explanation ?? '',
                hint: q.hint ?? '',
            });
        }
    }

    // ── Strategy 2: AI generation ──

    const isHardMode = difficulty >= 9;

    // Build the "avoid repeats" block to inject into prompts
    const avoidBlock = recentQuestions.length > 0
        ? `\n    IMPORTANT – Do NOT repeat or rephrase any of these recently asked questions:\n${recentQuestions.map((q, i) => `    ${i + 1}. ${q}`).join('\n')}\n    Generate a completely different question on a different specific topic within the category.`
        : '';

    // Category-specific tone guidance
    const categoryGuidance: Partial<Record<Category, { easy: string; hard: string }>> = {
        MOVIES: {
            easy: 'Focus on popular movies/TV shows kids aged 10-12 know well (Disney, Pixar, Marvel, Harry Potter, popular animated films). Ask about characters, plot points, actors, or fun facts.',
            hard:  'Focus on popular movies and TV shows that teenagers know well (Marvel, DC, big franchises, popular series, animated films, major blockbusters). Ask about plot details, memorable quotes, directors of famous films, behind-the-scenes facts, or awards. Do NOT ask about obscure indie films or film history from before 1980.',
        },
        ANIMALS: {
            easy: 'Well-known animals, habitats, diets, and fun facts suitable for a primary school science class.',
            hard:  'Deeper animal biology, unusual species, evolutionary adaptations, migration patterns, or animal kingdom classification.',
        },
        SPORTS: {
            easy: 'Popular sports rules, famous athletes, team names, and basic records that an 11-year-old sports fan would know.',
            hard:  'Specific records, statistics, historic moments, rules nuances, and lesser-known sports facts that require real sports knowledge.',
        },
        SPACE: {
            easy: 'Well-known space facts – planets, the Moon, famous missions, the solar system.',
            hard:  'Advanced astronomy – stellar classifications, specific missions (dates/crew), cosmological concepts, space physics, and lesser-known celestial objects.',
        },
        RANDOM: {
            easy: 'Mix of science, geography, nature, and pop culture accessible to an 11-year-old.',
            hard:  'Mix of advanced science, obscure geography, history, and culture that challenges most adults.',
        },
    };

    const catGuide = categoryGuidance[category as Category];
    const easyCatNote = catGuide ? `\n    Category guidance: ${catGuide.easy}` : '';
    const hardCatNote = catGuide ? `\n    Category guidance: ${catGuide.hard}` : '';

    const easyPrompt = `
    Generate a Trivia Question for a bright child aged 10-12.
    Category: ${category}${easyCatNote}

    Rules:
    - The question should be genuinely educational but accessible – think school quiz level.
    - Avoid baby questions (e.g. "what sound does a cow make?") but keep it fair for an 11-year-old.
    - All 4 choices must be plausible (no obviously silly wrong answers).
    - Return ONLY valid JSON. No markdown, no commentary.

    JSON fields:
    - "question": The question text.
    - "choices": Array of exactly 4 strings (plausible options).
    - "correctIndex": Integer 0-3.
    - "explanation": 1-2 sentence fun explanation.
    - "hint": A nudge that doesn't give it away.

    Example:
    {
      "question": "What is the chemical formula for table salt?",
      "choices": ["NaCl", "KCl", "H2O", "CaCO3"],
      "correctIndex": 0,
      "explanation": "Table salt is sodium chloride – one sodium (Na) atom bonded to one chlorine (Cl) atom.",
      "hint": "Think sodium and chlorine."
    }
    ${avoidBlock}
  `;

    const hardPrompt = `
    Generate a HARD Trivia Question for Ages 12 and Up.
    Category: ${category}${hardCatNote}

    Rules:
    - Must be genuinely challenging for a teenager – not answerable by pure guessing.
    - ALL 4 answer choices must be highly plausible. No obviously wrong options.
    - Questions should require real knowledge of the category, NOT general common sense.
    - Return ONLY valid JSON. No markdown, no commentary.

    JSON fields:
    - "question": Specific, challenging question.
    - "choices": Array of exactly 4 plausible strings.
    - "correctIndex": Integer 0-3.
    - "explanation": Interesting 1-2 sentence explanation.
    - "hint": A subtle clue that doesn't reveal the answer.
    ${avoidBlock}
  `;

    const data = await callOpenAI(
        "Generate Trivia JSON.",
        isHardMode ? hardPrompt : easyPrompt,
        RobustTriviaResponseSchema
    );

    if (!data) {
        // Fallback to local DB if AI fails
        const q = getLocalQuestion(ageGroup, category);
        if (q) {
            return jsonResponse({
                question: q.question,
                choices: q.choices,
                correctIndex: q.correctIndex,
                explanation: q.explanation ?? '',
                hint: q.hint ?? '',
            });
        }
        return errorResponse("Failed to generate", 500);
    }

    return jsonResponse(data);
};
