const API_BASE = '/.netlify/functions';
const APP_TOKEN = import.meta.env.VITE_APP_TOKEN || 'dev-token'; // Setup env var

const headers = {
    'Content-Type': 'application/json',
    'X-APP-TOKEN': APP_TOKEN
};

export async function fetchCDD(date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    // We append the params to the URL
    // Note: If no date, params.toString() is empty, which is fine
    const qs = params.toString();
    const url = `${API_BASE}/cdd${qs ? '?' + qs : ''}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('API Error');
    return res.json();
}

export async function fetchTrivia(category: string, difficulty: number) {
    if (import.meta.env.DEV) console.log("FETCH TRIVIA REQ:", { category, difficulty });
    const res = await fetch(`${API_BASE}/trivia`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ category, difficulty })
    });
    if (!res.ok) {
        // Try to read error body
        try {
            const err = await res.json();
            console.error("Trivia 400 Error:", err);
        } catch (e) { /* ignore */ }
        throw new Error('API Error');
    }
    return res.json();
}

export async function fetchRiddle(difficulty: number) {
    const res = await fetch(`${API_BASE}/riddle`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ difficulty })
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
}
