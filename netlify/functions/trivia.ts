import { Context } from '@netlify/functions';
import { z } from 'zod';
import { validateRequest, jsonResponse, errorResponse, parseBody } from './lib/utils';
import { callOpenAI } from './lib/openai';

const TriviaRequestSchema = z.object({
    category: z.enum(['ANIMALS', 'SPACE', 'MOVIES', 'SPORTS', 'RANDOM']),
    difficulty: z.number().min(0).max(10),
});

const TriviaResponseSchema = z.object({
    question: z.string(),
    choices: z.array(z.string()).length(4), // A, B, C, D
    // Robust Index Handling: Accept string/number, aliases, clamp to 0-3
    correctIndex: z.preprocess((val: any) => {
        // 1. Check aliases if main key missing (handled by Zod pre-process looking at parent? No, simple preprocess acts on value of key.
        // Wait, preprocess on a specific key only sees that key's value. 
        // To handle aliases at root, we need preprocess on the OBJECT.
        return val;
    }, z.union([z.string(), z.number()]).transform(val => {
        const num = Number(val);
        return isNaN(num) ? 0 : Math.min(3, Math.max(0, Math.floor(num)));
    })),
    explanation: z.string().optional(),
    hint: z.string().optional(),
});

// Helper to normalize aliased keys before Zod
const RobustTriviaResponseSchema = z.preprocess((raw: any) => {
    if (typeof raw !== 'object' || !raw) return raw;

    // Handle aliases for correctIndex
    if (raw.correctIndex === undefined) {
        if (raw.answerIndex !== undefined) raw.correctIndex = raw.answerIndex;
        else if (raw.correctAnswerIndex !== undefined) raw.correctIndex = raw.correctAnswerIndex;
        else raw.correctIndex = 0; // Fallback
    }
    return raw;
}, TriviaResponseSchema);

export default async (req: Request, context: Context) => {
    const authError = await validateRequest(req, context);
    if (authError) return authError;

    if (req.method !== 'POST') return errorResponse('Method Not Allowed', 405);

    const body = await parseBody(req, TriviaRequestSchema);
    if (!body) {
        if (process.env.DEBUG_LLM) console.log("Trivia 400 - Body failed parsing:", req.body);
        return errorResponse("Invalid body: Category or Difficulty missing/invalid");
    }

    const prompt = `
    Generate a Trivia Question.
    Category: ${body.category}
    Difficulty (0-10): ${body.difficulty} (Adapt content accordingly: 0=Easy, 10=Very Hard/Obscure).
    Target Audience: Smart 12-year-old.
    
    Constraints:
    1. Return ONLY valid JSON. No markdown. No commentary.
    2. 'question': The question text.
    3. 'choices': Array of exactly 4 strings.
    4. 'correctIndex': Integer 0-3 indicating the correct choice.
    5. 'explanation': Short explanation of the answer.
    6. 'hint': A helpful hint (don't give it away).

    Example JSON:
    {
      "question": "Which planet is known as the Red Planet?",
      "choices": ["Earth", "Mars", "Jupiter", "Venus"],
      "correctIndex": 1,
      "explanation": "Mars appears red due to iron oxide on its surface.",
      "hint": "It's named after the Roman god of war."
    }
  `;

    const data = await callOpenAI(
        "Generate Trivia JSON.",
        prompt,
        RobustTriviaResponseSchema
    );

    if (!data) return errorResponse("Failed to generate", 500);
    return jsonResponse(data);
};
