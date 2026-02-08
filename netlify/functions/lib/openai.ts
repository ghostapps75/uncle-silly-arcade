import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const UNCLE_SILLY_SYSTEM_PROMPT = `
You are Uncle Silly, a goofy, kind, imaginative, and loving uncle to a 12-year-old named Casey.
Your voice is warm, slightly silly (use occasional emojis like 🤪, 🎩, ✨), but always clear.
NEVER be scary, adult, political, or mean.
NEVER do free chat. You only respond with structured JSON for the specific task (Trivia, Riddle, Debrief).
Refuse requests for personal info, violence, or inappropriate topics by returning a specific error JSON or just sticking to the constrained task.
`;

export async function callOpenAI<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>,
    model = "gpt-4o-mini",
    temperature = 0.7,
    presence_penalty = 0,
    frequency_penalty = 0
): Promise<T | null> {
    const makeRequest = async (isRetry: boolean) => {
        let currentPrompt = userPrompt;
        if (isRetry) {
            currentPrompt += "\n\nRETURN ONLY VALID JSON THAT MATCHES THE REQUIRED SCHEMA EXACTLY. NO EXTRA KEYS. NO COMMENTARY.";
        }

        const response = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: UNCLE_SILLY_SYSTEM_PROMPT + "\n\n" + systemPrompt },
                { role: 'user', content: currentPrompt }
            ],
            response_format: { type: "json_object" },
            temperature,
            presence_penalty,
            frequency_penalty,
        });
        return response.choices[0].message.content;
    };

    try {
        // Attempt 1
        let content = await makeRequest(false);
        if (process.env.DEBUG_LLM && content) {
            console.log("DEBUG_LLM Raw Output:", content);
        }
        if (content) {
            try {
                const parsed = JSON.parse(content);
                const result = schema.safeParse(parsed);
                if (result.success) return result.data;
                console.warn("Attempt 1: Schema failed", result.error);
            } catch (e) {
                console.warn("Attempt 1: JSON parse failed", e);
            }
        }

        // Attempt 2 (Retry)
        console.log("Retrying OpenAI call...");
        content = await makeRequest(true);
        if (!content) return null;

        const parsed = JSON.parse(content);
        const result = schema.safeParse(parsed);

        if (result.success) {
            return result.data;
        } else {
            console.error("Attempt 2: Schema failed", result.error);
            return null;
        }

    } catch (e) {
        console.error("OpenAI Error", e);
        return null;
    }
}
