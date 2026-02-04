const appToken = 'dev-token'; // Assuming dev-token for local
const base = 'http://localhost:8888/.netlify/functions';

async function test() {
    try {
        // 1. CDD
        console.log('Testing CDD...');
        const cdd = await fetch(`${base}/cdd`, { headers: { 'x-app-token': appToken } }).then(r => r.json());
        if (!cdd.worldNote) throw new Error('CDD missing worldNote');
        console.log('CDD OK');

        // 2. Trivia
        console.log('Testing Trivia...');
        const trivia = await fetch(`${base}/trivia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-app-token': appToken },
            body: JSON.stringify({ category: 'SPACE', difficulty: 5 })
        }).then(r => r.json());
        if (!trivia.question || !trivia.choices || trivia.choices.length !== 4) throw new Error('Trivia invalid');
        console.log('Trivia OK');

        // 3. Riddle
        console.log('Testing Riddle...');
        const riddle = await fetch(`${base}/riddle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-app-token': appToken },
            body: JSON.stringify({ difficulty: 5 })
        }).then(r => r.json());
        if (!riddle.riddle || !riddle.choices || riddle.choices.length !== 4) throw new Error('Riddle invalid');
        console.log('Riddle OK');

        console.log('ALL TESTS PASSED');
    } catch (e) {
        console.error('TEST FAILED', e);
        process.exit(1);
    }
}
test();
