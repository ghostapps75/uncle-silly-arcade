import { Context } from '@netlify/functions';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { validateRequest, jsonResponse, errorResponse } from './lib/utils';
import { callOpenAI } from './lib/openai';
import nationalDaysData from './data/nationalDays.json';

// 1. Updated Schema: Removed worldNote and added dailyPulse
const CddLlmSchema = z.object({
    madeUpDayIfNoVerified: z.string().optional(),
    wordOfDay: z.object({
        word: z.string(),
        meaning: z.string(),
        example: z.string(),
        mnemonic: z.string(),
    }),
    dailyPulse: z.string(), // Forced narrative field
    onThisDay: z.string(),
    trivia: z.array(z.string()),
    joke: z.string(),
    closingLine: z.string(),
});

export default async (req: Request, context: Context) => {
    const authError = await validateRequest(req, context);
    if (authError) return authError;

    if (req.method !== 'GET') return errorResponse('Method Not Allowed', 405);

    let torontoTime = DateTime.now().setZone('America/Toronto');
    const dateKey = torontoTime.toFormat('yyyy-MM-dd');
    const isBirthday = torontoTime.month === 2 && torontoTime.day === 5;

    // 2. Data Logic: Rotating Countdown
    const countdownEvents = [
        { name: "Valentine's Day", date: "2026-02-14" },
        { name: "Family Day", date: "2026-02-16" },
        { name: "Toronto Comicon", date: "2026-03-20" },
        { name: "The Spring Equinox", date: "2026-03-20" },
        { name: "Easter Sunday", date: "2026-04-05" }
    ];

    // Find the next upcoming event
    const nextEvent = countdownEvents.find(e => DateTime.fromISO(e.date) > torontoTime) || countdownEvents[0];
    const daysAway = Math.ceil(DateTime.fromISO(nextEvent.date).diff(torontoTime, 'days').days);

    // 3. National Days
    // @ts-ignore
    const verifiedDays = nationalDaysData[dateKey];
    const hasVerified = Array.isArray(verifiedDays) && verifiedDays.length > 0;

    // 4. The "Anti-Octopus" Prompt
    const prompt = `
    Today is ${torontoTime.toLocaleString(DateTime.DATE_FULL)}.
    Is Birthday Edition: ${isBirthday}.
    Verified National Days: ${hasVerified ? JSON.stringify(verifiedDays) : "NONE"}.

    DAILY DATA FOR NARRATION:
    - It is exactly ${daysAway} days until ${nextEvent.name}.
    - The sun is setting around 5:35 PM in Toronto today.

    Task: Generate Casey's Daily Debrief.
    
    Constraints:
    1. 'dailyPulse': Write a 2-sentence excited update. Mention the countdown to ${nextEvent.name} and the sunset/daylight. 
       - CRITICAL: Do NOT mention octopuses, honey, or generic nature facts. 
       - Stick ONLY to the provided data.
    2. 'wordOfDay': Suitable for a 12-year-old.
    3. 'onThisDay': A historical event from this day.
    4. 'trivia': A list of 2 fun trivia questions.
    5. 'joke': A clean, funny joke.
    6. 'closingLine': A fun sign-off.

    Example JSON Structure:
    {
      "wordOfDay": { "word": "Luminous", "meaning": "Giving off light", "example": "The moon was luminous.", "mnemonic": "Lamps Usually Make Intense Night-light Using Some electricity" },
      "dailyPulse": "We are just ${daysAway} days away from ${nextEvent.name}! Plus, the sun stays up until 5:35 PM today—spring is coming!",
      "onThisDay": "In 1964, the Beatles arrived in America.",
      "trivia": ["Which planet has a Great Red Spot?", "Who painted the Mona Lisa?"],
      "joke": "What do you call a fake noodle? An impasta!",
      "closingLine": "Keep being awesome, Casey!",
      "madeUpDayIfNoVerified": "Uncle Silly's High-Five a Tree Day"
    }
  `;

    const llmData = await callOpenAI("Generate CDD JSON.", prompt, CddLlmSchema);
    if (!llmData) return errorResponse("Failed to generate content", 500);

    const finalData = {
        ...llmData,
        date: dateKey,
        isBirthdayEdition: isBirthday,
        verifiedNationalDays: hasVerified ? verifiedDays : [],
        // Clean up: worldNoteCategory is no longer used, so we remove it or default it
        worldNoteCategory: "science",
        madeUpDayIfNoVerified: hasVerified ? undefined : (llmData.madeUpDayIfNoVerified || "Uncle Silly's Mystery Day")
    };

    return jsonResponse(finalData, 200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate' // Disable edge caching while testing
    });
};