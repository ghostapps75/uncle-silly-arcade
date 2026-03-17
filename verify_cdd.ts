import { fetchCDD } from './src/lib/api.ts';

async function testDates() {
    console.log("Testing Trivia Rotation...\n");
    try {
        const dates = ['2026-03-17', '2026-03-18', '2026-03-19'];
        
        for (const date of dates) {
            console.log(`Fetching CDD for date: ${date}`);
            const data = await fetchCDD(date);
            console.log("Trivia:", data.trivia);
            console.log("------------------------");
        }
        console.log("SUCCESS");
    } catch (e) {
        console.error("FORMAT_ERROR", e);
    }
}

testDates();
