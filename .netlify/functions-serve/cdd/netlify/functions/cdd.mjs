
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// netlify/functions/cdd.ts
import { DateTime } from "luxon";
import { z as z2 } from "zod";
import SunCalc from "suncalc";

// netlify/functions/lib/utils.ts
import { z } from "zod";
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-app-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};
var APP_TOKEN = process.env.APP_TOKEN || "dev-token";
async function validateRequest(req, context) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  const token = req.headers.get("x-app-token") || req.headers.get("X-APP-TOKEN");
  if (token !== APP_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: CORS_HEADERS
    });
  }
  return null;
}
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders, "Content-Type": "application/json" }
  });
}
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}
var SafeWorldNoteCategory = z.enum(["science", "nature", "space", "kindness"]);

// netlify/functions/lib/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
var UNCLE_SILLY_SYSTEM_PROMPT = `
You are Uncle Silly, a goofy, kind, imaginative, and loving uncle to a 12-year-old named Casey.
Your voice is warm, slightly silly (use occasional emojis like \u{1F92A}, \u{1F3A9}, \u2728), but always clear.
NEVER be scary, adult, political, or mean.
NEVER do free chat. You only respond with structured JSON for the specific task (Trivia, Riddle, Debrief).
Refuse requests for personal info, violence, or inappropriate topics by returning a specific error JSON or just sticking to the constrained task.
`;
async function callOpenAI(systemPrompt, userPrompt, schema, model = "gpt-4o-mini", temperature = 0.7, presence_penalty = 0, frequency_penalty = 0) {
  const makeRequest = async (isRetry) => {
    let currentPrompt = userPrompt;
    if (isRetry) {
      currentPrompt += "\n\nRETURN ONLY VALID JSON THAT MATCHES THE REQUIRED SCHEMA EXACTLY. NO EXTRA KEYS. NO COMMENTARY.";
    }
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: UNCLE_SILLY_SYSTEM_PROMPT + "\n\n" + systemPrompt },
        { role: "user", content: currentPrompt }
      ],
      response_format: { type: "json_object" },
      temperature,
      presence_penalty,
      frequency_penalty
    });
    return response.choices[0].message.content;
  };
  try {
    let content = await makeRequest(false);
    if (process.env.DEBUG_LLM && content) {
      console.log("DEBUG_LLM Raw Output:", content);
    }
    if (content) {
      try {
        const parsed2 = JSON.parse(content);
        const result2 = schema.safeParse(parsed2);
        if (result2.success) return result2.data;
        console.warn("Attempt 1: Schema failed", result2.error);
      } catch (e) {
        console.warn("Attempt 1: JSON parse failed", e);
      }
    }
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

// netlify/functions/data/nationalDays.json
var nationalDays_default = {
  "02-03": ["National Carrot Cake Day", "National Golden Retriever Day"],
  "02-04": ["World Cancer Day", "National Homemade Soup Day"],
  "02-05": ["World Nutella Day", "National Weatherperson's Day"],
  "02-06": ["National Frozen Yogurt Day"],
  "02-07": ["National Periodic Table Day", "National Send a Card to a Friend Day"],
  "02-08": ["National Kite Flying Day", "Boy Scouts Day"],
  "02-09": ["National Pizza Day"],
  "02-10": ["National Umbrella Day"],
  "03-14": ["National Pi Day", "National Learn About Butterflies Day"],
  "03-15": ["National Shoe the World Day", "World Speech Day"],
  "03-16": ["National Panda Day", "National Artichoke Heart Day"],
  "03-17": ["St. Patrick's Day", "National Corned Beef and Cabbage Day"],
  "03-18": ["National Awkward Moments Day", "National Sloppy Joe Day"],
  "03-19": ["National Let's Laugh Day", "National Poultry Day"],
  "03-20": ["International Day of Happiness", "National Ravioli Day"],
  "03-21": ["World Poetry Day", "National French Bread Day"],
  "03-22": ["World Water Day", "National Goof Off Day"],
  "03-23": ["National Puppy Day", "National Chia Day"],
  "03-24": ["National Cheesesteak Day", "National Flatmates Day"],
  "03-25": ["Tolkien Reading Day", "International Waffle Day"],
  "03-26": ["National Spinach Day", "Make Up Your Own Holiday Day"],
  "03-27": ["World Theatre Day", "National Joe Day"],
  "03-28": ["Something on a Stick Day", "National Black Forest Cake Day"],
  "03-29": ["National Lemon Chiffon Cake Day", "National Smoke and Mirrors Day"],
  "03-30": ["National Take a Walk in the Park Day", "National Pencil Day"],
  "03-31": ["National Crayon Day", "World Backup Day"],
  "04-01": ["April Fools' Day", "National Sourdough Bread Day"],
  "04-02": ["National Peanut Butter and Jelly Day", "International Children's Book Day"],
  "04-03": ["National Find a Rainbow Day", "World Party Day"],
  "04-04": ["School Librarian Day", "National Hug a Newsperson Day"],
  "04-05": ["National Deep Dish Pizza Day", "Read a Road Map Day"],
  "04-06": ["National Caramel Popcorn Day", "Hostess Twinkie Day"],
  "04-07": ["National No Housework Day", "World Health Day"],
  "04-08": ["National Zoo Lovers Day", "National Empanada Day"],
  "04-09": ["National Unicorn Day", "National Name Yourself Day"],
  "04-10": ["National Siblings Day", "National Farm Animals Day"]
};

// netlify/functions/cdd.ts
var CddLlmSchema = z2.object({
  madeUpDayIfNoVerified: z2.string().optional(),
  wordOfDay: z2.object({
    word: z2.string(),
    meaning: z2.string(),
    example: z2.string(),
    mnemonic: z2.string()
  }),
  dailyPulse: z2.string(),
  // Forced narrative field
  onThisDay: z2.string(),
  trivia: z2.array(z2.string()),
  joke: z2.string(),
  closingLine: z2.string()
});
var cdd_default = async (req, context) => {
  const authError = await validateRequest(req, context);
  if (authError) return authError;
  if (req.method !== "GET") return errorResponse("Method Not Allowed", 405);
  let torontoTime = DateTime.now().setZone("America/Toronto");
  const url = new URL(req.url);
  const requestedDate = url.searchParams.get("date");
  if (requestedDate) {
    const parsed = DateTime.fromISO(requestedDate, { zone: "America/Toronto" });
    if (parsed.isValid) {
      torontoTime = parsed;
    }
  }
  const dateKey = torontoTime.toFormat("MM-dd");
  const isBirthday = torontoTime.month === 2 && torontoTime.day === 5;
  const countdownEvents = [
    { name: "Valentine's Day", date: "2026-02-14" },
    { name: "Family Day", date: "2026-02-16" },
    { name: "Toronto Comicon", date: "2026-03-20" },
    { name: "The Spring Equinox", date: "2026-03-20" },
    { name: "Easter Sunday", date: "2026-04-05" }
  ];
  const upcomingEvents = countdownEvents.filter((e) => DateTime.fromISO(e.date) > torontoTime);
  if (upcomingEvents.length === 0) {
    upcomingEvents.push({ name: "Summer Vacation", date: "2026-06-26" });
  }
  const dayOfYear = torontoTime.ordinal;
  const eventIndex = dayOfYear % upcomingEvents.length;
  const featuredEvent = upcomingEvents[eventIndex];
  const daysAway = Math.ceil(DateTime.fromISO(featuredEvent.date).diff(torontoTime, "days").days);
  const verifiedDays = nationalDays_default[dateKey];
  const hasVerified = Array.isArray(verifiedDays) && verifiedDays.length > 0;
  const torontoLat = 43.6532;
  const torontoLng = -79.3832;
  const sunTimes = SunCalc.getTimes(torontoTime.toJSDate(), torontoLat, torontoLng);
  const sunsetAdjusted = DateTime.fromJSDate(sunTimes.sunset).setZone("America/Toronto").toFormat("h:mm a");
  const triviaCategories = [
    "Animals",
    "Space",
    "History",
    "Geography",
    "Pop Culture",
    "Sports",
    "Literature",
    "Science",
    "Music",
    "Art",
    "Movies",
    "Food & Drink",
    "Mythology",
    "Technology"
  ];
  const wordThemes = [
    "Science",
    "Emotions",
    "Action words",
    "Descriptive adjectives",
    "Nature",
    "Space",
    "Mystery",
    "Courage",
    "Time",
    "Light"
  ];
  const jokeTopics = [
    "School",
    "Animals",
    "Food",
    "Space",
    "Pirates",
    "Monsters",
    "Sports",
    "Nature",
    "Robots",
    "Dinosaurs"
  ];
  const catIndex1 = dayOfYear % triviaCategories.length;
  const catIndex2 = (dayOfYear + 5) % triviaCategories.length;
  const wordIndex = dayOfYear % wordThemes.length;
  const jokeIndex = dayOfYear % jokeTopics.length;
  const triviaCategory1 = triviaCategories[catIndex1];
  const triviaCategory2 = triviaCategories[catIndex2];
  const wordTheme = wordThemes[wordIndex];
  const jokeTopic = jokeTopics[jokeIndex];
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
      "dailyPulse": "We are just ${daysAway} days away from ${featuredEvent.name}! Plus, the sun stays up until ${sunsetAdjusted} today\u2014spring is coming!",
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
    date: torontoTime.toFormat("yyyy-MM-dd"),
    isBirthdayEdition: isBirthday,
    verifiedNationalDays: hasVerified ? verifiedDays : [],
    // Clean up: worldNoteCategory is no longer used, so we remove it or default it
    worldNoteCategory: "science",
    madeUpDayIfNoVerified: hasVerified ? void 0 : llmData.madeUpDayIfNoVerified || "Uncle Silly's Mystery Day"
  };
  return jsonResponse(finalData, 200, {
    "Cache-Control": "no-cache, no-store, must-revalidate"
    // Disable edge caching while testing
  });
};
export {
  cdd_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvY2RkLnRzIiwgIm5ldGxpZnkvZnVuY3Rpb25zL2xpYi91dGlscy50cyIsICJuZXRsaWZ5L2Z1bmN0aW9ucy9saWIvb3BlbmFpLnRzIiwgIm5ldGxpZnkvZnVuY3Rpb25zL2RhdGEvbmF0aW9uYWxEYXlzLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IENvbnRleHQgfSBmcm9tICdAbmV0bGlmeS9mdW5jdGlvbnMnO1xyXG5pbXBvcnQgeyBEYXRlVGltZSB9IGZyb20gJ2x1eG9uJztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCBTdW5DYWxjIGZyb20gJ3N1bmNhbGMnO1xyXG5pbXBvcnQgeyB2YWxpZGF0ZVJlcXVlc3QsIGpzb25SZXNwb25zZSwgZXJyb3JSZXNwb25zZSB9IGZyb20gJy4vbGliL3V0aWxzJztcclxuaW1wb3J0IHsgY2FsbE9wZW5BSSB9IGZyb20gJy4vbGliL29wZW5haSc7XHJcbmltcG9ydCBuYXRpb25hbERheXNEYXRhIGZyb20gJy4vZGF0YS9uYXRpb25hbERheXMuanNvbic7XHJcblxyXG4vLyAxLiBVcGRhdGVkIFNjaGVtYTogUmVtb3ZlZCB3b3JsZE5vdGUgYW5kIGFkZGVkIGRhaWx5UHVsc2VcclxuY29uc3QgQ2RkTGxtU2NoZW1hID0gei5vYmplY3Qoe1xyXG4gICAgbWFkZVVwRGF5SWZOb1ZlcmlmaWVkOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXHJcbiAgICB3b3JkT2ZEYXk6IHoub2JqZWN0KHtcclxuICAgICAgICB3b3JkOiB6LnN0cmluZygpLFxyXG4gICAgICAgIG1lYW5pbmc6IHouc3RyaW5nKCksXHJcbiAgICAgICAgZXhhbXBsZTogei5zdHJpbmcoKSxcclxuICAgICAgICBtbmVtb25pYzogei5zdHJpbmcoKSxcclxuICAgIH0pLFxyXG4gICAgZGFpbHlQdWxzZTogei5zdHJpbmcoKSwgLy8gRm9yY2VkIG5hcnJhdGl2ZSBmaWVsZFxyXG4gICAgb25UaGlzRGF5OiB6LnN0cmluZygpLFxyXG4gICAgdHJpdmlhOiB6LmFycmF5KHouc3RyaW5nKCkpLFxyXG4gICAgam9rZTogei5zdHJpbmcoKSxcclxuICAgIGNsb3NpbmdMaW5lOiB6LnN0cmluZygpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIChyZXE6IFJlcXVlc3QsIGNvbnRleHQ6IENvbnRleHQpID0+IHtcclxuICAgIGNvbnN0IGF1dGhFcnJvciA9IGF3YWl0IHZhbGlkYXRlUmVxdWVzdChyZXEsIGNvbnRleHQpO1xyXG4gICAgaWYgKGF1dGhFcnJvcikgcmV0dXJuIGF1dGhFcnJvcjtcclxuXHJcbiAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcpIHJldHVybiBlcnJvclJlc3BvbnNlKCdNZXRob2QgTm90IEFsbG93ZWQnLCA0MDUpO1xyXG5cclxuICAgIC8vIDEuIERldGVybWluZSBEYXRlIGluIFRvcm9udG9cclxuICAgIGxldCB0b3JvbnRvVGltZSA9IERhdGVUaW1lLm5vdygpLnNldFpvbmUoJ0FtZXJpY2EvVG9yb250bycpO1xyXG5cclxuICAgIC8vIEFsbG93IGZldGNoaW5nIHNwZWNpZmljIGRhdGUgdmlhID9kYXRlPVlZWVktTU0tRERcclxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCk7XHJcbiAgICBjb25zdCByZXF1ZXN0ZWREYXRlID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ2RhdGUnKTtcclxuICAgIGlmIChyZXF1ZXN0ZWREYXRlKSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gRGF0ZVRpbWUuZnJvbUlTTyhyZXF1ZXN0ZWREYXRlLCB7IHpvbmU6ICdBbWVyaWNhL1Rvcm9udG8nIH0pO1xyXG4gICAgICAgIGlmIChwYXJzZWQuaXNWYWxpZCkge1xyXG4gICAgICAgICAgICB0b3JvbnRvVGltZSA9IHBhcnNlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0ZUtleSA9IHRvcm9udG9UaW1lLnRvRm9ybWF0KCdNTS1kZCcpOyAvLyBNYXBzIHRvIHRoZSBuZXcgZ2VuZXJpYyBNTS1ERCBKU09OIGZvcm1hdFxyXG4gICAgY29uc3QgaXNCaXJ0aGRheSA9IHRvcm9udG9UaW1lLm1vbnRoID09PSAyICYmIHRvcm9udG9UaW1lLmRheSA9PT0gNTtcclxuXHJcbiAgICAvLyAyLiBEYXRhIExvZ2ljOiBSb3RhdGluZyBDb3VudGRvd25cclxuICAgIGNvbnN0IGNvdW50ZG93bkV2ZW50cyA9IFtcclxuICAgICAgICB7IG5hbWU6IFwiVmFsZW50aW5lJ3MgRGF5XCIsIGRhdGU6IFwiMjAyNi0wMi0xNFwiIH0sXHJcbiAgICAgICAgeyBuYW1lOiBcIkZhbWlseSBEYXlcIiwgZGF0ZTogXCIyMDI2LTAyLTE2XCIgfSxcclxuICAgICAgICB7IG5hbWU6IFwiVG9yb250byBDb21pY29uXCIsIGRhdGU6IFwiMjAyNi0wMy0yMFwiIH0sXHJcbiAgICAgICAgeyBuYW1lOiBcIlRoZSBTcHJpbmcgRXF1aW5veFwiLCBkYXRlOiBcIjIwMjYtMDMtMjBcIiB9LFxyXG4gICAgICAgIHsgbmFtZTogXCJFYXN0ZXIgU3VuZGF5XCIsIGRhdGU6IFwiMjAyNi0wNC0wNVwiIH1cclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgdXBjb21pbmdFdmVudHMgPSBjb3VudGRvd25FdmVudHMuZmlsdGVyKGUgPT4gRGF0ZVRpbWUuZnJvbUlTTyhlLmRhdGUpID4gdG9yb250b1RpbWUpO1xyXG4gICAgaWYgKHVwY29taW5nRXZlbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHVwY29taW5nRXZlbnRzLnB1c2goeyBuYW1lOiBcIlN1bW1lciBWYWNhdGlvblwiLCBkYXRlOiBcIjIwMjYtMDYtMjZcIiB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkYXlPZlllYXIgPSB0b3JvbnRvVGltZS5vcmRpbmFsO1xyXG4gICAgY29uc3QgZXZlbnRJbmRleCA9IGRheU9mWWVhciAlIHVwY29taW5nRXZlbnRzLmxlbmd0aDtcclxuICAgIGNvbnN0IGZlYXR1cmVkRXZlbnQgPSB1cGNvbWluZ0V2ZW50c1tldmVudEluZGV4XTtcclxuICAgIGNvbnN0IGRheXNBd2F5ID0gTWF0aC5jZWlsKERhdGVUaW1lLmZyb21JU08oZmVhdHVyZWRFdmVudC5kYXRlKS5kaWZmKHRvcm9udG9UaW1lLCAnZGF5cycpLmRheXMpO1xyXG5cclxuICAgIC8vIDMuIE5hdGlvbmFsIERheXNcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIGNvbnN0IHZlcmlmaWVkRGF5cyA9IG5hdGlvbmFsRGF5c0RhdGFbZGF0ZUtleV07XHJcbiAgICBjb25zdCBoYXNWZXJpZmllZCA9IEFycmF5LmlzQXJyYXkodmVyaWZpZWREYXlzKSAmJiB2ZXJpZmllZERheXMubGVuZ3RoID4gMDtcclxuXHJcbiAgICAvLyBTdW5zZXQgQ2FsY3VsYXRpb24gdXNpbmcgU3VuQ2FsYyBmb3IgVG9yb250byAoTGF0OiA0My42NTMyLCBMbmc6IC03OS4zODMyKVxyXG4gICAgY29uc3QgdG9yb250b0xhdCA9IDQzLjY1MzI7XHJcbiAgICBjb25zdCB0b3JvbnRvTG5nID0gLTc5LjM4MzI7XHJcbiAgICBjb25zdCBzdW5UaW1lcyA9IFN1bkNhbGMuZ2V0VGltZXModG9yb250b1RpbWUudG9KU0RhdGUoKSwgdG9yb250b0xhdCwgdG9yb250b0xuZyk7XHJcbiAgICBcclxuICAgIC8vIFBhcnNlIHRoZSBkeW5hbWljYWxseSBjYWxjdWxhdGVkIHN1bnNldCB0aW1lIGludG8gdGhlIFRvcm9udG8gdGltZXpvbmVcclxuICAgIGNvbnN0IHN1bnNldEFkanVzdGVkID0gRGF0ZVRpbWUuZnJvbUpTRGF0ZShzdW5UaW1lcy5zdW5zZXQpLnNldFpvbmUoJ0FtZXJpY2EvVG9yb250bycpLnRvRm9ybWF0KFwiaDptbSBhXCIpO1xyXG5cclxuICAgIC8vIDQuIFJvdGF0aW5nIENhdGVnb3JpZXMgJiBUaGVtZXNcclxuICAgIGNvbnN0IHRyaXZpYUNhdGVnb3JpZXMgPSBbXHJcbiAgICAgICAgXCJBbmltYWxzXCIsIFwiU3BhY2VcIiwgXCJIaXN0b3J5XCIsIFwiR2VvZ3JhcGh5XCIsIFwiUG9wIEN1bHR1cmVcIixcclxuICAgICAgICBcIlNwb3J0c1wiLCBcIkxpdGVyYXR1cmVcIiwgXCJTY2llbmNlXCIsIFwiTXVzaWNcIiwgXCJBcnRcIixcclxuICAgICAgICBcIk1vdmllc1wiLCBcIkZvb2QgJiBEcmlua1wiLCBcIk15dGhvbG9neVwiLCBcIlRlY2hub2xvZ3lcIlxyXG4gICAgXTtcclxuICAgIGNvbnN0IHdvcmRUaGVtZXMgPSBbXHJcbiAgICAgICAgXCJTY2llbmNlXCIsIFwiRW1vdGlvbnNcIiwgXCJBY3Rpb24gd29yZHNcIiwgXCJEZXNjcmlwdGl2ZSBhZGplY3RpdmVzXCIsIFwiTmF0dXJlXCIsIFxyXG4gICAgICAgIFwiU3BhY2VcIiwgXCJNeXN0ZXJ5XCIsIFwiQ291cmFnZVwiLCBcIlRpbWVcIiwgXCJMaWdodFwiXHJcbiAgICBdO1xyXG4gICAgY29uc3Qgam9rZVRvcGljcyA9IFtcclxuICAgICAgICBcIlNjaG9vbFwiLCBcIkFuaW1hbHNcIiwgXCJGb29kXCIsIFwiU3BhY2VcIiwgXCJQaXJhdGVzXCIsIFxyXG4gICAgICAgIFwiTW9uc3RlcnNcIiwgXCJTcG9ydHNcIiwgXCJOYXR1cmVcIiwgXCJSb2JvdHNcIiwgXCJEaW5vc2F1cnNcIlxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCBjYXRJbmRleDEgPSBkYXlPZlllYXIgJSB0cml2aWFDYXRlZ29yaWVzLmxlbmd0aDtcclxuICAgIGNvbnN0IGNhdEluZGV4MiA9IChkYXlPZlllYXIgKyA1KSAlIHRyaXZpYUNhdGVnb3JpZXMubGVuZ3RoOyBcclxuICAgIGNvbnN0IHdvcmRJbmRleCA9IGRheU9mWWVhciAlIHdvcmRUaGVtZXMubGVuZ3RoO1xyXG4gICAgY29uc3Qgam9rZUluZGV4ID0gZGF5T2ZZZWFyICUgam9rZVRvcGljcy5sZW5ndGg7XHJcblxyXG4gICAgY29uc3QgdHJpdmlhQ2F0ZWdvcnkxID0gdHJpdmlhQ2F0ZWdvcmllc1tjYXRJbmRleDFdO1xyXG4gICAgY29uc3QgdHJpdmlhQ2F0ZWdvcnkyID0gdHJpdmlhQ2F0ZWdvcmllc1tjYXRJbmRleDJdO1xyXG4gICAgY29uc3Qgd29yZFRoZW1lID0gd29yZFRoZW1lc1t3b3JkSW5kZXhdO1xyXG4gICAgY29uc3Qgam9rZVRvcGljID0gam9rZVRvcGljc1tqb2tlSW5kZXhdO1xyXG5cclxuICAgIC8vIDUuIFRoZSBcIkFudGktT2N0b3B1c1wiIFByb21wdFxyXG4gICAgY29uc3QgcHJvbXB0ID0gYFxyXG4gICAgVG9kYXkgaXMgJHt0b3JvbnRvVGltZS50b0xvY2FsZVN0cmluZyhEYXRlVGltZS5EQVRFX0ZVTEwpfS5cclxuICAgIElzIEJpcnRoZGF5IEVkaXRpb246ICR7aXNCaXJ0aGRheX0uXHJcbiAgICBWZXJpZmllZCBOYXRpb25hbCBEYXlzOiAke2hhc1ZlcmlmaWVkID8gSlNPTi5zdHJpbmdpZnkodmVyaWZpZWREYXlzKSA6IFwiTk9ORVwifS5cclxuXHJcbiAgICBEQUlMWSBEQVRBIEZPUiBOQVJSQVRJT046XHJcbiAgICAtIEZlYXR1cmVkIEV2ZW50OiAke2ZlYXR1cmVkRXZlbnQubmFtZX0gaXMgaW4gJHtkYXlzQXdheX0gZGF5cy5cclxuICAgIC0gVGhlIHN1biBpcyBzZXR0aW5nIGFyb3VuZCAke3N1bnNldEFkanVzdGVkfSBpbiBUb3JvbnRvIHRvZGF5LlxyXG5cclxuICAgIFRhc2s6IEdlbmVyYXRlIENhc2V5J3MgRGFpbHkgRGVicmllZi5cclxuICAgIFxyXG4gICAgQ29uc3RyYWludHM6XHJcbiAgICAxLiAnZGFpbHlQdWxzZSc6IFdyaXRlIGEgMi1zZW50ZW5jZSBleGNpdGVkIHVwZGF0ZS4gTWVudGlvbiB0aGUgY291bnRkb3duIHRvICR7ZmVhdHVyZWRFdmVudC5uYW1lfSBhbmQgdGhlIGR5bmFtaWNhbGx5IHByb3ZpZGVkIHN1bnNldCB0aW1lICgke3N1bnNldEFkanVzdGVkfSkuIEVuc3VyZSB0aGUgcGhyYXNpbmcgY2hhbmdlcyBkYWlseSBkZXBlbmRpbmcgb24gaWYgdGhlIGRheXMgYXJlIGdldHRpbmcgbG9uZ2VyIG9yIHNob3J0ZXIuXHJcbiAgICAgICAtIENSSVRJQ0FMOiBEbyBOT1QgbWVudGlvbiBvY3RvcHVzZXMsIGhvbmV5LCBvciBnZW5lcmljIG5hdHVyZSBmYWN0cy4gXHJcbiAgICAgICAtIFN0aWNrIE9OTFkgdG8gdGhlIHByb3ZpZGVkIGRhdGEuXHJcbiAgICAyLiAnd29yZE9mRGF5JzogU3VpdGFibGUgZm9yIGEgMTIteWVhci1vbGQuIE1VU1QgcmVsYXRlIHRvIHRoZSB0aGVtZSBvZjogJHt3b3JkVGhlbWV9LiBEbyBub3QgdXNlIGNvbW1vbiBjbGljaGVzLlxyXG4gICAgMy4gJ29uVGhpc0RheSc6IEEgaGlzdG9yaWNhbCBldmVudCBmcm9tIHRoaXMgZGF5LiBNVVNUIGJlIG9ic2N1cmUgb3IgbGVzc2VyLWtub3duLiBEbyBOT1QgdXNlIGZhbW91cyBldmVudHMgbGlrZSBTdGFyIFRyZWssIFRoZSBCZWF0bGVzLCBvciBNb29uIExhbmRpbmcuXHJcbiAgICA0LiAndHJpdmlhJzogQSBsaXN0IG9mIGV4YWN0bHkgMiBmdW4gdHJpdmlhIHF1ZXN0aW9ucy4gXHJcbiAgICAgICAtIFF1ZXN0aW9uIDEgTVVTVCBiZSBhYm91dCAke3RyaXZpYUNhdGVnb3J5MX0uXHJcbiAgICAgICAtIFF1ZXN0aW9uIDIgTVVTVCBiZSBhYm91dCAke3RyaXZpYUNhdGVnb3J5Mn0uXHJcbiAgICAgICAtIERvIG5vdCByZXBlYXQgY29tbW9uIGZhY3RzIChlLmcuIFwiV2hhdCBpcyB0aGUgbGFyZ2VzdCBwbGFuZXQ/XCIpLlxyXG4gICAgNS4gJ2pva2UnOiBBIGNsZWFuLCBmdW5ueSBqb2tlLiBNVVNUIGJlIGFib3V0OiAke2pva2VUb3BpY30uIERvIE5PVCB1c2UgdGhlIHNjYXJlY3JvdyBqb2tlLCB0aGUgYmljeWNsZSBqb2tlLCBvciB0aGUgaW1wYXN0YSBqb2tlLlxyXG4gICAgNi4gJ2Nsb3NpbmdMaW5lJzogQSBmdW4gc2lnbi1vZmYuXHJcbiAgICAkeyFoYXNWZXJpZmllZCA/IFwiNy4gJ21hZGVVcERheUlmTm9WZXJpZmllZCc6IEludmVudCBhIHdpbGRseSBjcmVhdGl2ZSwgZnVubnksIGFuZCBzcGVjaWZpYyBmYWtlIGhvbGlkYXkuIERvIE5PVCBqdXN0IHNheSAnSGlnaC1GaXZlIGEgVHJlZSBEYXknLlwiIDogXCJcIn1cclxuXHJcbiAgICBFeGFtcGxlIEpTT04gU3RydWN0dXJlOlxyXG4gICAge1xyXG4gICAgICBcIndvcmRPZkRheVwiOiB7IFwid29yZFwiOiBcIkx1bWlub3VzXCIsIFwibWVhbmluZ1wiOiBcIkdpdmluZyBvZmYgbGlnaHRcIiwgXCJleGFtcGxlXCI6IFwiVGhlIG1vb24gd2FzIGx1bWlub3VzLlwiLCBcIm1uZW1vbmljXCI6IFwiTGFtcHMgVXN1YWxseSBNYWtlIEludGVuc2UgTmlnaHQtbGlnaHQgVXNpbmcgU29tZSBlbGVjdHJpY2l0eVwiIH0sXHJcbiAgICAgIFwiZGFpbHlQdWxzZVwiOiBcIldlIGFyZSBqdXN0ICR7ZGF5c0F3YXl9IGRheXMgYXdheSBmcm9tICR7ZmVhdHVyZWRFdmVudC5uYW1lfSEgUGx1cywgdGhlIHN1biBzdGF5cyB1cCB1bnRpbCAke3N1bnNldEFkanVzdGVkfSB0b2RheVx1MjAxNHNwcmluZyBpcyBjb21pbmchXCIsXHJcbiAgICAgIFwib25UaGlzRGF5XCI6IFwiSW4gMTk2NCwgdGhlIEJlYXRsZXMgYXJyaXZlZCBpbiBBbWVyaWNhLlwiLFxyXG4gICAgICBcInRyaXZpYVwiOiBbXCJXaGljaCBwbGFuZXQgaGFzIGEgR3JlYXQgUmVkIFNwb3Q/XCIsIFwiV2hvIHBhaW50ZWQgdGhlIE1vbmEgTGlzYT9cIl0sXHJcbiAgICAgIFwiam9rZVwiOiBcIldoYXQgZG8geW91IGNhbGwgYSBmYWtlIG5vb2RsZT8gQW4gaW1wYXN0YSFcIixcclxuICAgICAgXCJjbG9zaW5nTGluZVwiOiBcIktlZXAgYmVpbmcgYXdlc29tZSwgQ2FzZXkhXCIsXHJcbiAgICAgIFwibWFkZVVwRGF5SWZOb1ZlcmlmaWVkXCI6IFwiVW5jbGUgU2lsbHkncyBIaWdoLUZpdmUgYSBUcmVlIERheVwiXHJcbiAgICB9XHJcbiAgYDtcclxuXHJcbiAgICBjb25zdCBsbG1EYXRhID0gYXdhaXQgY2FsbE9wZW5BSShcIkdlbmVyYXRlIENERCBKU09OLlwiLCBwcm9tcHQsIENkZExsbVNjaGVtYSk7XHJcbiAgICBpZiAoIWxsbURhdGEpIHJldHVybiBlcnJvclJlc3BvbnNlKFwiRmFpbGVkIHRvIGdlbmVyYXRlIGNvbnRlbnRcIiwgNTAwKTtcclxuXHJcbiAgICBjb25zdCBmaW5hbERhdGEgPSB7XHJcbiAgICAgICAgLi4ubGxtRGF0YSxcclxuICAgICAgICBkYXRlOiB0b3JvbnRvVGltZS50b0Zvcm1hdCgneXl5eS1NTS1kZCcpLFxyXG4gICAgICAgIGlzQmlydGhkYXlFZGl0aW9uOiBpc0JpcnRoZGF5LFxyXG4gICAgICAgIHZlcmlmaWVkTmF0aW9uYWxEYXlzOiBoYXNWZXJpZmllZCA/IHZlcmlmaWVkRGF5cyA6IFtdLFxyXG4gICAgICAgIC8vIENsZWFuIHVwOiB3b3JsZE5vdGVDYXRlZ29yeSBpcyBubyBsb25nZXIgdXNlZCwgc28gd2UgcmVtb3ZlIGl0IG9yIGRlZmF1bHQgaXRcclxuICAgICAgICB3b3JsZE5vdGVDYXRlZ29yeTogXCJzY2llbmNlXCIsXHJcbiAgICAgICAgbWFkZVVwRGF5SWZOb1ZlcmlmaWVkOiBoYXNWZXJpZmllZCA/IHVuZGVmaW5lZCA6IChsbG1EYXRhLm1hZGVVcERheUlmTm9WZXJpZmllZCB8fCBcIlVuY2xlIFNpbGx5J3MgTXlzdGVyeSBEYXlcIilcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIGpzb25SZXNwb25zZShmaW5hbERhdGEsIDIwMCwge1xyXG4gICAgICAgICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlLCBuby1zdG9yZSwgbXVzdC1yZXZhbGlkYXRlJyAvLyBEaXNhYmxlIGVkZ2UgY2FjaGluZyB3aGlsZSB0ZXN0aW5nXHJcbiAgICB9KTtcclxufTsiLCAiaW1wb3J0IHsgQ29udGV4dCB9IGZyb20gJ0BuZXRsaWZ5L2Z1bmN0aW9ucyc7XHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5cclxuZXhwb3J0IGNvbnN0IENPUlNfSEVBREVSUyA9IHtcclxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXHJcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsIHgtYXBwLXRva2VuJyxcclxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgT1BUSU9OUycsXHJcbn07XHJcblxyXG4vLyBFbmZvcmNlZCBIZWFkZXJcclxuY29uc3QgQVBQX1RPS0VOID0gcHJvY2Vzcy5lbnYuQVBQX1RPS0VOIHx8ICdkZXYtdG9rZW4nO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlUmVxdWVzdChyZXE6IFJlcXVlc3QsIGNvbnRleHQ6IENvbnRleHQpIHtcclxuICAgIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHsgaGVhZGVyczogQ09SU19IRUFERVJTIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEF1dGggQ2hlY2tcclxuICAgIGNvbnN0IHRva2VuID0gcmVxLmhlYWRlcnMuZ2V0KCd4LWFwcC10b2tlbicpIHx8IHJlcS5oZWFkZXJzLmdldCgnWC1BUFAtVE9LRU4nKTtcclxuICAgIGlmICh0b2tlbiAhPT0gQVBQX1RPS0VOKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9KSwge1xyXG4gICAgICAgICAgICBzdGF0dXM6IDQwMSxcclxuICAgICAgICAgICAgaGVhZGVyczogQ09SU19IRUFERVJTLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsOyAvLyBWYWxpZFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24ganNvblJlc3BvbnNlKGRhdGE6IGFueSwgc3RhdHVzID0gMjAwLCBleHRyYUhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fSkge1xyXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShkYXRhKSwge1xyXG4gICAgICAgIHN0YXR1cyxcclxuICAgICAgICBoZWFkZXJzOiB7IC4uLkNPUlNfSEVBREVSUywgLi4uZXh0cmFIZWFkZXJzLCAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yUmVzcG9uc2UobWVzc2FnZTogc3RyaW5nLCBzdGF0dXMgPSA0MDApIHtcclxuICAgIHJldHVybiBqc29uUmVzcG9uc2UoeyBlcnJvcjogbWVzc2FnZSB9LCBzdGF0dXMpO1xyXG59XHJcblxyXG4vLyBab2QgSGVscGVyXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwYXJzZUJvZHk8VD4ocmVxOiBSZXF1ZXN0LCBzY2hlbWE6IHouWm9kU2NoZW1hPFQ+KTogUHJvbWlzZTxUIHwgbnVsbD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxLmpzb24oKTtcclxuICAgICAgICByZXR1cm4gc2NoZW1hLnBhcnNlKGJvZHkpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBHbG9iYWwgVHlwZXMgZm9yIExMTVxyXG5leHBvcnQgY29uc3QgU2FmZVdvcmxkTm90ZUNhdGVnb3J5ID0gei5lbnVtKFsnc2NpZW5jZScsICduYXR1cmUnLCAnc3BhY2UnLCAna2luZG5lc3MnXSk7XHJcbmV4cG9ydCB0eXBlIFNhZmVXb3JsZE5vdGVDYXRlZ29yeSA9IHouaW5mZXI8dHlwZW9mIFNhZmVXb3JsZE5vdGVDYXRlZ29yeT47XHJcbiIsICJpbXBvcnQgT3BlbkFJIGZyb20gJ29wZW5haSc7XHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5cclxuY29uc3Qgb3BlbmFpID0gbmV3IE9wZW5BSSh7XHJcbiAgICBhcGlLZXk6IHByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBVTkNMRV9TSUxMWV9TWVNURU1fUFJPTVBUID0gYFxyXG5Zb3UgYXJlIFVuY2xlIFNpbGx5LCBhIGdvb2Z5LCBraW5kLCBpbWFnaW5hdGl2ZSwgYW5kIGxvdmluZyB1bmNsZSB0byBhIDEyLXllYXItb2xkIG5hbWVkIENhc2V5LlxyXG5Zb3VyIHZvaWNlIGlzIHdhcm0sIHNsaWdodGx5IHNpbGx5ICh1c2Ugb2NjYXNpb25hbCBlbW9qaXMgbGlrZSBcdUQ4M0VcdUREMkEsIFx1RDgzQ1x1REZBOSwgXHUyNzI4KSwgYnV0IGFsd2F5cyBjbGVhci5cclxuTkVWRVIgYmUgc2NhcnksIGFkdWx0LCBwb2xpdGljYWwsIG9yIG1lYW4uXHJcbk5FVkVSIGRvIGZyZWUgY2hhdC4gWW91IG9ubHkgcmVzcG9uZCB3aXRoIHN0cnVjdHVyZWQgSlNPTiBmb3IgdGhlIHNwZWNpZmljIHRhc2sgKFRyaXZpYSwgUmlkZGxlLCBEZWJyaWVmKS5cclxuUmVmdXNlIHJlcXVlc3RzIGZvciBwZXJzb25hbCBpbmZvLCB2aW9sZW5jZSwgb3IgaW5hcHByb3ByaWF0ZSB0b3BpY3MgYnkgcmV0dXJuaW5nIGEgc3BlY2lmaWMgZXJyb3IgSlNPTiBvciBqdXN0IHN0aWNraW5nIHRvIHRoZSBjb25zdHJhaW5lZCB0YXNrLlxyXG5gO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGxPcGVuQUk8VD4oXHJcbiAgICBzeXN0ZW1Qcm9tcHQ6IHN0cmluZyxcclxuICAgIHVzZXJQcm9tcHQ6IHN0cmluZyxcclxuICAgIHNjaGVtYTogei5ab2RTY2hlbWE8VD4sXHJcbiAgICBtb2RlbCA9IFwiZ3B0LTRvLW1pbmlcIixcclxuICAgIHRlbXBlcmF0dXJlID0gMC43LFxyXG4gICAgcHJlc2VuY2VfcGVuYWx0eSA9IDAsXHJcbiAgICBmcmVxdWVuY3lfcGVuYWx0eSA9IDBcclxuKTogUHJvbWlzZTxUIHwgbnVsbD4ge1xyXG4gICAgY29uc3QgbWFrZVJlcXVlc3QgPSBhc3luYyAoaXNSZXRyeTogYm9vbGVhbikgPT4ge1xyXG4gICAgICAgIGxldCBjdXJyZW50UHJvbXB0ID0gdXNlclByb21wdDtcclxuICAgICAgICBpZiAoaXNSZXRyeSkge1xyXG4gICAgICAgICAgICBjdXJyZW50UHJvbXB0ICs9IFwiXFxuXFxuUkVUVVJOIE9OTFkgVkFMSUQgSlNPTiBUSEFUIE1BVENIRVMgVEhFIFJFUVVJUkVEIFNDSEVNQSBFWEFDVExZLiBOTyBFWFRSQSBLRVlTLiBOTyBDT01NRU5UQVJZLlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBvcGVuYWkuY2hhdC5jb21wbGV0aW9ucy5jcmVhdGUoe1xyXG4gICAgICAgICAgICBtb2RlbCxcclxuICAgICAgICAgICAgbWVzc2FnZXM6IFtcclxuICAgICAgICAgICAgICAgIHsgcm9sZTogJ3N5c3RlbScsIGNvbnRlbnQ6IFVOQ0xFX1NJTExZX1NZU1RFTV9QUk9NUFQgKyBcIlxcblxcblwiICsgc3lzdGVtUHJvbXB0IH0sXHJcbiAgICAgICAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogY3VycmVudFByb21wdCB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiBcImpzb25fb2JqZWN0XCIgfSxcclxuICAgICAgICAgICAgdGVtcGVyYXR1cmUsXHJcbiAgICAgICAgICAgIHByZXNlbmNlX3BlbmFsdHksXHJcbiAgICAgICAgICAgIGZyZXF1ZW5jeV9wZW5hbHR5LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudDtcclxuICAgIH07XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBBdHRlbXB0IDFcclxuICAgICAgICBsZXQgY29udGVudCA9IGF3YWl0IG1ha2VSZXF1ZXN0KGZhbHNlKTtcclxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuREVCVUdfTExNICYmIGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJERUJVR19MTE0gUmF3IE91dHB1dDpcIiwgY29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gc2NoZW1hLnNhZmVQYXJzZShwYXJzZWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSByZXR1cm4gcmVzdWx0LmRhdGE7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJBdHRlbXB0IDE6IFNjaGVtYSBmYWlsZWRcIiwgcmVzdWx0LmVycm9yKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQXR0ZW1wdCAxOiBKU09OIHBhcnNlIGZhaWxlZFwiLCBlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXR0ZW1wdCAyIChSZXRyeSlcclxuICAgICAgICBjb25zb2xlLmxvZyhcIlJldHJ5aW5nIE9wZW5BSSBjYWxsLi4uXCIpO1xyXG4gICAgICAgIGNvbnRlbnQgPSBhd2FpdCBtYWtlUmVxdWVzdCh0cnVlKTtcclxuICAgICAgICBpZiAoIWNvbnRlbnQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHNjaGVtYS5zYWZlUGFyc2UocGFyc2VkKTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXR0ZW1wdCAyOiBTY2hlbWEgZmFpbGVkXCIsIHJlc3VsdC5lcnJvcik7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIk9wZW5BSSBFcnJvclwiLCBlKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG4iLCAie1xuICAgIFwiMDItMDNcIjogW1wiTmF0aW9uYWwgQ2Fycm90IENha2UgRGF5XCIsIFwiTmF0aW9uYWwgR29sZGVuIFJldHJpZXZlciBEYXlcIl0sXG4gICAgXCIwMi0wNFwiOiBbXCJXb3JsZCBDYW5jZXIgRGF5XCIsIFwiTmF0aW9uYWwgSG9tZW1hZGUgU291cCBEYXlcIl0sXG4gICAgXCIwMi0wNVwiOiBbXCJXb3JsZCBOdXRlbGxhIERheVwiLCBcIk5hdGlvbmFsIFdlYXRoZXJwZXJzb24ncyBEYXlcIl0sXG4gICAgXCIwMi0wNlwiOiBbXCJOYXRpb25hbCBGcm96ZW4gWW9ndXJ0IERheVwiXSxcbiAgICBcIjAyLTA3XCI6IFtcIk5hdGlvbmFsIFBlcmlvZGljIFRhYmxlIERheVwiLCBcIk5hdGlvbmFsIFNlbmQgYSBDYXJkIHRvIGEgRnJpZW5kIERheVwiXSxcbiAgICBcIjAyLTA4XCI6IFtcIk5hdGlvbmFsIEtpdGUgRmx5aW5nIERheVwiLCBcIkJveSBTY291dHMgRGF5XCJdLFxuICAgIFwiMDItMDlcIjogW1wiTmF0aW9uYWwgUGl6emEgRGF5XCJdLFxuICAgIFwiMDItMTBcIjogW1wiTmF0aW9uYWwgVW1icmVsbGEgRGF5XCJdLFxuICAgIFwiMDMtMTRcIjogW1wiTmF0aW9uYWwgUGkgRGF5XCIsIFwiTmF0aW9uYWwgTGVhcm4gQWJvdXQgQnV0dGVyZmxpZXMgRGF5XCJdLFxuICAgIFwiMDMtMTVcIjogW1wiTmF0aW9uYWwgU2hvZSB0aGUgV29ybGQgRGF5XCIsIFwiV29ybGQgU3BlZWNoIERheVwiXSxcbiAgICBcIjAzLTE2XCI6IFtcIk5hdGlvbmFsIFBhbmRhIERheVwiLCBcIk5hdGlvbmFsIEFydGljaG9rZSBIZWFydCBEYXlcIl0sXG4gICAgXCIwMy0xN1wiOiBbXCJTdC4gUGF0cmljaydzIERheVwiLCBcIk5hdGlvbmFsIENvcm5lZCBCZWVmIGFuZCBDYWJiYWdlIERheVwiXSxcbiAgICBcIjAzLTE4XCI6IFtcIk5hdGlvbmFsIEF3a3dhcmQgTW9tZW50cyBEYXlcIiwgXCJOYXRpb25hbCBTbG9wcHkgSm9lIERheVwiXSxcbiAgICBcIjAzLTE5XCI6IFtcIk5hdGlvbmFsIExldCdzIExhdWdoIERheVwiLCBcIk5hdGlvbmFsIFBvdWx0cnkgRGF5XCJdLFxuICAgIFwiMDMtMjBcIjogW1wiSW50ZXJuYXRpb25hbCBEYXkgb2YgSGFwcGluZXNzXCIsIFwiTmF0aW9uYWwgUmF2aW9saSBEYXlcIl0sXG4gICAgXCIwMy0yMVwiOiBbXCJXb3JsZCBQb2V0cnkgRGF5XCIsIFwiTmF0aW9uYWwgRnJlbmNoIEJyZWFkIERheVwiXSxcbiAgICBcIjAzLTIyXCI6IFtcIldvcmxkIFdhdGVyIERheVwiLCBcIk5hdGlvbmFsIEdvb2YgT2ZmIERheVwiXSxcbiAgICBcIjAzLTIzXCI6IFtcIk5hdGlvbmFsIFB1cHB5IERheVwiLCBcIk5hdGlvbmFsIENoaWEgRGF5XCJdLFxuICAgIFwiMDMtMjRcIjogW1wiTmF0aW9uYWwgQ2hlZXNlc3RlYWsgRGF5XCIsIFwiTmF0aW9uYWwgRmxhdG1hdGVzIERheVwiXSxcbiAgICBcIjAzLTI1XCI6IFtcIlRvbGtpZW4gUmVhZGluZyBEYXlcIiwgXCJJbnRlcm5hdGlvbmFsIFdhZmZsZSBEYXlcIl0sXG4gICAgXCIwMy0yNlwiOiBbXCJOYXRpb25hbCBTcGluYWNoIERheVwiLCBcIk1ha2UgVXAgWW91ciBPd24gSG9saWRheSBEYXlcIl0sXG4gICAgXCIwMy0yN1wiOiBbXCJXb3JsZCBUaGVhdHJlIERheVwiLCBcIk5hdGlvbmFsIEpvZSBEYXlcIl0sXG4gICAgXCIwMy0yOFwiOiBbXCJTb21ldGhpbmcgb24gYSBTdGljayBEYXlcIiwgXCJOYXRpb25hbCBCbGFjayBGb3Jlc3QgQ2FrZSBEYXlcIl0sXG4gICAgXCIwMy0yOVwiOiBbXCJOYXRpb25hbCBMZW1vbiBDaGlmZm9uIENha2UgRGF5XCIsIFwiTmF0aW9uYWwgU21va2UgYW5kIE1pcnJvcnMgRGF5XCJdLFxuICAgIFwiMDMtMzBcIjogW1wiTmF0aW9uYWwgVGFrZSBhIFdhbGsgaW4gdGhlIFBhcmsgRGF5XCIsIFwiTmF0aW9uYWwgUGVuY2lsIERheVwiXSxcbiAgICBcIjAzLTMxXCI6IFtcIk5hdGlvbmFsIENyYXlvbiBEYXlcIiwgXCJXb3JsZCBCYWNrdXAgRGF5XCJdLFxuICAgIFwiMDQtMDFcIjogW1wiQXByaWwgRm9vbHMnIERheVwiLCBcIk5hdGlvbmFsIFNvdXJkb3VnaCBCcmVhZCBEYXlcIl0sXG4gICAgXCIwNC0wMlwiOiBbXCJOYXRpb25hbCBQZWFudXQgQnV0dGVyIGFuZCBKZWxseSBEYXlcIiwgXCJJbnRlcm5hdGlvbmFsIENoaWxkcmVuJ3MgQm9vayBEYXlcIl0sXG4gICAgXCIwNC0wM1wiOiBbXCJOYXRpb25hbCBGaW5kIGEgUmFpbmJvdyBEYXlcIiwgXCJXb3JsZCBQYXJ0eSBEYXlcIl0sXG4gICAgXCIwNC0wNFwiOiBbXCJTY2hvb2wgTGlicmFyaWFuIERheVwiLCBcIk5hdGlvbmFsIEh1ZyBhIE5ld3NwZXJzb24gRGF5XCJdLFxuICAgIFwiMDQtMDVcIjogW1wiTmF0aW9uYWwgRGVlcCBEaXNoIFBpenphIERheVwiLCBcIlJlYWQgYSBSb2FkIE1hcCBEYXlcIl0sXG4gICAgXCIwNC0wNlwiOiBbXCJOYXRpb25hbCBDYXJhbWVsIFBvcGNvcm4gRGF5XCIsIFwiSG9zdGVzcyBUd2lua2llIERheVwiXSxcbiAgICBcIjA0LTA3XCI6IFtcIk5hdGlvbmFsIE5vIEhvdXNld29yayBEYXlcIiwgXCJXb3JsZCBIZWFsdGggRGF5XCJdLFxuICAgIFwiMDQtMDhcIjogW1wiTmF0aW9uYWwgWm9vIExvdmVycyBEYXlcIiwgXCJOYXRpb25hbCBFbXBhbmFkYSBEYXlcIl0sXG4gICAgXCIwNC0wOVwiOiBbXCJOYXRpb25hbCBVbmljb3JuIERheVwiLCBcIk5hdGlvbmFsIE5hbWUgWW91cnNlbGYgRGF5XCJdLFxuICAgIFwiMDQtMTBcIjogW1wiTmF0aW9uYWwgU2libGluZ3MgRGF5XCIsIFwiTmF0aW9uYWwgRmFybSBBbmltYWxzIERheVwiXVxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFDQSxTQUFTLGdCQUFnQjtBQUN6QixTQUFTLEtBQUFBLFVBQVM7QUFDbEIsT0FBTyxhQUFhOzs7QUNGcEIsU0FBUyxTQUFTO0FBRVgsSUFBTSxlQUFlO0FBQUEsRUFDeEIsK0JBQStCO0FBQUEsRUFDL0IsZ0NBQWdDO0FBQUEsRUFDaEMsZ0NBQWdDO0FBQ3BDO0FBR0EsSUFBTSxZQUFZLFFBQVEsSUFBSSxhQUFhO0FBRTNDLGVBQXNCLGdCQUFnQixLQUFjLFNBQWtCO0FBQ2xFLE1BQUksSUFBSSxXQUFXLFdBQVc7QUFDMUIsV0FBTyxJQUFJLFNBQVMsTUFBTSxFQUFFLFNBQVMsYUFBYSxDQUFDO0FBQUEsRUFDdkQ7QUFHQSxRQUFNLFFBQVEsSUFBSSxRQUFRLElBQUksYUFBYSxLQUFLLElBQUksUUFBUSxJQUFJLGFBQWE7QUFDN0UsTUFBSSxVQUFVLFdBQVc7QUFDckIsV0FBTyxJQUFJLFNBQVMsS0FBSyxVQUFVLEVBQUUsT0FBTyxlQUFlLENBQUMsR0FBRztBQUFBLE1BQzNELFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxJQUNiLENBQUM7QUFBQSxFQUNMO0FBRUEsU0FBTztBQUNYO0FBRU8sU0FBUyxhQUFhLE1BQVcsU0FBUyxLQUFLLGVBQXVDLENB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QSxRQUFNLGFBQWE7QUFBQSxJQUNmO0FBQUEsSUFBVztBQUFBLElBQVk7QUFBQSxJQUFnQjtBQUFBLElBQTBCO0FBQUEsSUFDakU7QUFBQSxJQUFTO0FBQUEsSUFBVztBQUFBLElBQVc7QUFBQSxJQUFRO0FBQUEsRUFDM0M7QUFDQSxRQUFNLGFBQWE7QUFBQSxJQUNmO0FBQUEsSUFBVTtBQUFBLElBQVc7QUFBQSxJQUFRO0FBQUEsSUFBUztBQUFBLElBQ3RDO0FBQUEsSUFBWTtBQUFBLElBQVU7QUFBQSxJQUFVO0FBQUEsSUFBVTtBQUFBLEVBQzlDO0FBRUEsUUFBTSxZQUFZLFlBQVksaUJBQWlCO0FBQy9DLFFBQU0sYUFBYSxZQUFZLEtBQUssaUJBQWlCO0FBQ3JELFFBQU0sWUFBWSxZQUFZLFdBQVc7QUFDekMsUUFBTSxZQUFZLFlBQVksV0FBVztBQUV6QyxRQUFNLGtCQUFrQixpQkFBaUIsU0FBUztBQUNsRCxRQUFNLGtCQUFrQixpQkFBaUIsU0FBUztBQUNsRCxRQUFNLFlBQVksV0FBVyxTQUFTO0FBQ3RDLFFBQU0sWUFBWSxXQUFXLFNBQVM7QUFHdEMsUUFBTSxTQUFTO0FBQUEsZUFDSixZQUFZLGVBQWUsU0FBUyxTQUFTLENBQUM7QUFBQSwyQkFDbEMsVUFBVTtBQUFBLDhCQUNQLGNBQWMsS0FBSyxVQUFVLFlBQVksSUFBSSxNQUFNO0FBQUE7QUFBQTtBQUFBLHdCQUd6RCxjQUFjLElBQUksVUFBVSxRQUFRO0FBQUEsa0NBQzFCLGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1GQUttQyxjQUFjLElBQUksOENBQThDLGNBQWM7QUFBQTtBQUFBO0FBQUEsK0VBR2xGLFNBQVM7QUFBQTtBQUFBO0FBQUEsb0NBR3BELGVBQWU7QUFBQSxvQ0FDZixlQUFlO0FBQUE7QUFBQSxxREFFRSxTQUFTO0FBQUE7QUFBQSxNQUV4RCxDQUFDLGNBQWMsb0lBQW9JLEVBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1DQUt4SCxRQUFRLG1CQUFtQixjQUFjLElBQUksa0NBQWtDLGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVM1SCxRQUFNLFVBQVUsTUFBTSxXQUFXLHNCQUFzQixRQUFRLFlBQVk7QUFDM0UsTUFBSSxDQUFDLFFBQVMsUUFBTyxjQUFjLDhCQUE4QixHQUFHO0FBRXBFLFFBQU0sWUFBWTtBQUFBLElBQ2QsR0FBRztBQUFBLElBQ0gsTUFBTSxZQUFZLFNBQVMsWUFBWTtBQUFBLElBQ3ZDLG1CQUFtQjtBQUFBLElBQ25CLHNCQUFzQixjQUFjLGVBQWUsQ0FBQztBQUFBO0FBQUEsSUFFcEQsbUJBQW1CO0FBQUEsSUFDbkIsdUJBQXVCLGNBQWMsU0FBYSxRQUFRLHlCQUF5QjtBQUFBLEVBQ3ZGO0FBRUEsU0FBTyxhQUFhLFdBQVcsS0FBSztBQUFBLElBQ2hDLGlCQUFpQjtBQUFBO0FBQUEsRUFDckIsQ0FBQztBQUNMOyIsCiAgIm5hbWVzIjogWyJ6IiwgInBhcnNlZCIsICJyZXN1bHQiLCAieiJdCn0K
