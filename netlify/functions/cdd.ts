import { Context } from '@netlify/functions';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { validateRequest, jsonResponse, errorResponse, CORS_HEADERS, SafeWorldNoteCategory } from './lib/utils';
import { callOpenAI } from './lib/openai';
import nationalDaysData from './data/nationalDays.json';

const CddLlmSchema = z.object({
    madeUpDayIfNoVerified: z.string().optional(),
    wordOfDay: z.object({
        word: z.string(),
        meaning: z.string(),
        example: z.string(),
        mnemonic: z.string(),
    }),
    worldNote: z.string(),
    worldNoteCategory: z.string(), // We validate/coerce this manually
    onThisDay: z.string(),
    trivia: z.array(z.string()),
    joke: z.string(),
    closingLine: z.string(),
});

const CddResponseSchema = CddLlmSchema.extend({
    date: z.string(),
    isBirthdayEdition: z.boolean(),
    verifiedNationalDays: z.array(z.string()),
    worldNoteCategory: SafeWorldNoteCategory,
});

export default async (req: Request, context: Context) => {
    const authError = await validateRequest(req, context);
    if (authError) return authError;

    if (req.method !== 'GET') return errorResponse('Method Not Allowed', 405);

    // 1. Determine Date in Toronto
    let torontoTime = DateTime.now().setZone('America/Toronto');

    // DEBUG HOOK: Allow forcing a date via ?debugDate=YYYY-MM-DD
    const url = new URL(req.url);
    const debugDate = url.searchParams.get('debugDate');
    if (debugDate) {
        // Security Check: Only allow if DEV or if proper secret header is present
        const isDev = process.env.NETLIFY_DEV === 'true' || process.env.NODE_ENV !== 'production';
        const hasToken = req.headers.get('x-app-token') === process.env.APP_TOKEN;

        if (isDev || hasToken) {
            const parsed = DateTime.fromISO(debugDate, { zone: 'America/Toronto' });
            if (parsed.isValid) {
                torontoTime = parsed;
                console.log(`[CDD] Debug Date Active: ${debugDate}`);
            }
        }
    }

    const dateKey = torontoTime.toFormat('yyyy-MM-dd');
    const isBirthday = torontoTime.month === 2 && torontoTime.day === 5;

    // 2. Fetch National Days
    // @ts-ignore
    const verifiedDays = nationalDaysData[dateKey];
    const hasVerified = Array.isArray(verifiedDays) && verifiedDays.length > 0;

    // 3. Prepare Prompt
    const prompt = `
    Today is ${torontoTime.toLocaleString(DateTime.DATE_FULL)}.
    Is Birthday Edition: ${isBirthday}.
    Verified National Days: ${hasVerified ? JSON.stringify(verifiedDays) : "NONE"}.

    Task: Generate Casey's Daily Debrief.
    
    Constraints:
    1. If Verified National Days is "NONE":
       - You MUST populate 'madeUpDayIfNoVerified' with a fun, made-up day (e.g., "Uncle Silly's Be Kind to Ants Day").
       - You must NEVER refer to this made-up day as a "National Day" or "International Day".
    2. 'worldNote': A short, positive news/fact about science, nature, space, or kindness.
    3. 'worldNoteCategory': Must be exactly one of: "science", "nature", "space", "kindness".
    4. 'wordOfDay': Object with { word, meaning, example, mnemonic }. Suitable for a 12-year-old.
    5. 'onThisDay': A historical event from this day (safe/clean).
    6. 'trivia': A list of 1-3 trivia questions (strings).
    7. 'joke': A clean, funny joke.
    8. 'closingLine': A fun sign-off.
    9. DO NOT include 'date', 'isBirthdayEdition', or 'verifiedNationalDays' in your JSON. These are added by the server.
    
    Example JSON:
    {
      "wordOfDay": { "word": "Nebula", "meaning": "Cloud of dust in space", "example": "Look at that nebula!", "mnemonic": "Never Eat Big Uglies Like Apples" },
      "worldNote": "Bees communicate by dancing!",
      "worldNoteCategory": "nature",
      "onThisDay": "In 1969, humans landed on the moon.",
      "trivia": ["How many legs does a spider have?", "What is the capital of France?"],
      "joke": "Why did the chicken cross the road? To get to the other side!",
      "closingLine": "Stay silly, Casey!",
      "madeUpDayIfNoVerified": "Uncle Silly's Wiggle Your Ears Day"
    }

    Return strict JSON matching the schema. No commentary.
  `;

    // 4. Call Model (Validate against LLM Schema)
    const llmData = await callOpenAI(
        "Generate CDD JSON.",
        prompt,
        CddLlmSchema
    );

    if (!llmData) return errorResponse("Failed to generate content", 500);

    // 5. Coerce/Sanitize Categories
    let safeCategory: SafeWorldNoteCategory = 'science'; // Default Fallback
    const rawCat = llmData.worldNoteCategory.toLowerCase().trim();
    if (SafeWorldNoteCategory.options.includes(rawCat as any)) {
        safeCategory = rawCat as SafeWorldNoteCategory;
    }

    // 6. Construct Final Response using Server Truth
    const finalData = {
        ...llmData,
        date: dateKey,
        isBirthdayEdition: isBirthday,
        verifiedNationalDays: hasVerified ? verifiedDays : [],
        worldNoteCategory: safeCategory,
        // Enforce Logic: If verified days exist, nukes made-up day. If not, ensures fallback.
        madeUpDayIfNoVerified: hasVerified ? undefined : (llmData.madeUpDayIfNoVerified || "Uncle Silly's Mystery Fun Day")
    };

    return jsonResponse(finalData, 200, {
        'Cache-Control': 'public, max-age=3600'
    });
};
