import { Context } from '@netlify/functions';
import { DateTime } from 'luxon';
import { z } from 'zod';
import SunCalc from 'suncalc';
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

    // 1. Determine Date in Toronto
    let torontoTime = DateTime.now().setZone('America/Toronto');

    // Allow fetching specific date via ?date=YYYY-MM-DD
    const url = new URL(req.url);
    const requestedDate = url.searchParams.get('date');
    if (requestedDate) {
        const parsed = DateTime.fromISO(requestedDate, { zone: 'America/Toronto' });
        if (parsed.isValid) {
            torontoTime = parsed;
        }
    }

    const dateKey = torontoTime.toFormat('MM-dd'); // Maps to the new generic MM-DD JSON format
    const isBirthday = torontoTime.month === 2 && torontoTime.day === 5;

    // 2. Data Logic: Rotating Countdown
    const countdownEvents = [
        { name: "Valentine's Day", date: "2026-02-14" },
        { name: "Family Day", date: "2026-02-16" },
        { name: "Toronto Comicon", date: "2026-03-20" },
        { name: "The Spring Equinox", date: "2026-03-20" },
        { name: "Easter Sunday", date: "2026-04-05" }
    ];

    const upcomingEvents = countdownEvents.filter(e => DateTime.fromISO(e.date) > torontoTime);
    if (upcomingEvents.length === 0) {
        upcomingEvents.push({ name: "Summer Vacation", date: "2026-06-26" });
    }

    const dayOfYear = torontoTime.ordinal;
    const eventIndex = dayOfYear % upcomingEvents.length;
    const featuredEvent = upcomingEvents[eventIndex];
    const daysAway = Math.ceil(DateTime.fromISO(featuredEvent.date).diff(torontoTime, 'days').days);

    // 3. National Days
    // @ts-ignore
    const verifiedDays = nationalDaysData[dateKey];
    const hasVerified = Array.isArray(verifiedDays) && verifiedDays.length > 0;

    // Sunset Calculation using SunCalc for Toronto (Lat: 43.6532, Lng: -79.3832)
    const torontoLat = 43.6532;
    const torontoLng = -79.3832;
    const sunTimes = SunCalc.getTimes(torontoTime.toJSDate(), torontoLat, torontoLng);
    
    // Parse the dynamically calculated sunset time into the Toronto timezone
    const sunsetAdjusted = DateTime.fromJSDate(sunTimes.sunset).setZone('America/Toronto').toFormat("h:mm a");

    // 4. Rotating Categories & Themes
    const triviaCategories = [
        "Animals", "Space", "History", "Geography", "Pop Culture",
        "Sports", "Literature", "Science", "Music", "Art",
        "Movies", "Food & Drink", "Mythology", "Technology"
    ];
    const wordThemes = [
        "Science", "Emotions", "Action words", "Descriptive adjectives", "Nature", 
        "Space", "Mystery", "Courage", "Time", "Light"
    ];
    const jokeTopics = [
        "School", "Animals", "Food", "Space", "Pirates", 
        "Monsters", "Sports", "Nature", "Robots", "Dinosaurs"
    ];

    const catIndex1 = dayOfYear % triviaCategories.length;
    const catIndex2 = (dayOfYear + 5) % triviaCategories.length; 
    const wordIndex = dayOfYear % wordThemes.length;
    const jokeIndex = dayOfYear % jokeTopics.length;

    const triviaCategory1 = triviaCategories[catIndex1];
    const triviaCategory2 = triviaCategories[catIndex2];
    const wordTheme = wordThemes[wordIndex];
    const jokeTopic = jokeTopics[jokeIndex];

    // 5. The "Anti-Octopus" Prompt
    const prompt = `
    Today is ${torontoTime.toLocaleString(DateTime.DATE_FULL)}.
    Is Birthday Edition: ${isBirthday}.
    Verified National Days: ${hasVerified ? JSON.stringify(verifiedDays) : "NONE"}.

    DAILY DATA FOR NARRATION:
    - Featured Event: ${featuredEvent.name} is in ${daysAway} days.
    - The sun is setting around ${sunsetAdjusted} in Toronto today.

    Task: Generate Casey's Daily Debrief.
    
    Constraints:
    1. 'dailyPulse': Write a 2-sentence excited update. Mention the countdown to ${featuredEvent.name} and the dynamically provided sunset time (${sunsetAdjusted}). Ensure the phrasing changes daily depending on if the days are getting longer or shorter.
       - CRITICAL: Do NOT mention octopuses, honey, or generic nature facts. 
       - Stick ONLY to the provided data.
    2. 'wordOfDay': Suitable for a 12-year-old. MUST relate to the theme of: ${wordTheme}. Do not use common cliches.
    3. 'onThisDay': A historical event from this day. MUST be obscure or lesser-known. Do NOT use famous events like Star Trek, The Beatles, or Moon Landing.
    4. 'trivia': A list of exactly 2 fun trivia questions. 
       - Question 1 MUST be about ${triviaCategory1}.
       - Question 2 MUST be about ${triviaCategory2}.
       - Do not repeat common facts (e.g. "What is the largest planet?").
    5. 'joke': A clean, funny joke. MUST be about: ${jokeTopic}. Do NOT use the scarecrow joke, the bicycle joke, or the impasta joke.
    6. 'closingLine': A fun sign-off.
    ${!hasVerified ? "7. 'madeUpDayIfNoVerified': Invent a wildly creative, funny, and specific fake holiday. Do NOT just say 'High-Five a Tree Day'." : ""}

    Example JSON Structure:
    {
      "wordOfDay": { "word": "Luminous", "meaning": "Giving off light", "example": "The moon was luminous.", "mnemonic": "Lamps Usually Make Intense Night-light Using Some electricity" },
      "dailyPulse": "We are just ${daysAway} days away from ${featuredEvent.name}! Plus, the sun stays up until ${sunsetAdjusted} today—spring is coming!",
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
        date: torontoTime.toFormat('yyyy-MM-dd'),
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