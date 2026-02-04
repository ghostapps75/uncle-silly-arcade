import { Context } from '@netlify/functions';
import { z } from 'zod';
import { validateRequest, jsonResponse, errorResponse, parseBody } from './lib/utils';
import { callOpenAI } from './lib/openai';

const RiddleRequestSchema = z.object({
    difficulty: z.number().min(0).max(10),
});

const RiddleResponseSchema = z.object({
    riddle: z.string(),
    choices: z.array(z.string()).length(4), // A, B, C, D
    // Robust Index Handling: Accept string/number, aliases, clamp to 0-3
    correctIndex: z.preprocess((val: any) => {
        return val;
    }, z.union([z.string(), z.number()]).transform(val => {
        const num = Number(val);
        return isNaN(num) ? 0 : Math.min(3, Math.max(0, Math.floor(num)));
    })),
    explanation: z.string().optional(),
    hint: z.string().optional(),
});

// Helper to normalize aliased keys before Zod
const RobustRiddleResponseSchema = z.preprocess((raw: any) => {
    if (typeof raw !== 'object' || !raw) return raw;

    // Handle 'question' instead of 'riddle' hallucination
    if (!raw.riddle && raw.question) raw.riddle = raw.question;

    // Handle aliases for correctIndex
    if (raw.correctIndex === undefined) {
        if (raw.answerIndex !== undefined) raw.correctIndex = raw.answerIndex;
        else if (raw.correctAnswerIndex !== undefined) raw.correctIndex = raw.correctAnswerIndex;
        else raw.correctIndex = 0; // Fallback
    }
    return raw;
}, RiddleResponseSchema);

export default async (req: Request, context: Context) => {
    const authError = await validateRequest(req, context);
    if (authError) return authError;

    if (req.method !== 'POST') return errorResponse('Method Not Allowed', 405);

    const body = await parseBody(req, RiddleRequestSchema);
    if (!body) {
        if (process.env.DEBUG_LLM) console.log("Riddle 400 - Body failed parsing:", req.body);
        return errorResponse("Invalid body");
    }

    const prompt = `
    Generate a Riddle.
    Difficulty: ${body.difficulty} (0=Easy, 10=Impossible).
    Style: Clever, wordplay, or logic.
    Target Audience: Smart 12-year-old.
    
    Constraints:
    1. Return ONLY valid JSON. No markdown. No commentary.
    2. 'riddle': The text of the riddle.
    3. 'choices': Array of exactly 4 strings (1 correct, 3 wrong).
    4. 'correctIndex': Integer 0-3 indicating the correct choice.
    5. 'explanation': Short explanation of the answer.
    6. 'hint': A helpful hint.

    Example JSON:
    {
      "riddle": "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      "choices": ["A ghost", "An echo", "A cloud", "A shadow"],
      "correctIndex": 1,
      "explanation": "An echo is sound reflecting off surfaces, often carried by wind/air.",
      "hint": "You might hear me in a canyon."
    }
  `;

    const data = await callOpenAI(
        "Generate Riddle JSON.",
        prompt,
        RobustRiddleResponseSchema
    );

    if (!data) return errorResponse("Failed to generate", 500);
    return jsonResponse(data);
};
