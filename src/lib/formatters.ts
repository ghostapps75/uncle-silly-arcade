
export function formatCDD(data: any): string {
    return `
# ☀️ Good Morning!

**Date:** ${data.date} ${data.isBirthdayEdition ? '🎂 **HAPPY BIRTHDAY CASEY!** 🎈' : ''}

## 📅 National Days
${data.verifiedNationalDays?.length > 0 ? data.verifiedNationalDays.map((d: string) => `- ${d}`).join('\n') : `- ${data.madeUpDayIfNoVerified} (Classic Uncle Silly!)`}

## ❤️ Daily Pulse
${data.dailyPulse || data.worldNote}

## 📜 On This Day
${data.onThisDay}

## 💬 Word of the Day: **${data.wordOfDay.word}**
*${data.wordOfDay.meaning}*
> "${data.wordOfDay.example}"

**Joke:** ${data.joke}

${data.closingLine}
`.trim();
}
