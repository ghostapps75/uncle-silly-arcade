import { useReducer, useEffect, useCallback } from 'react';
import type { AppContext, Action } from '../state/types';
import { STATE_CONFIG } from '../state/machine';
import { calculateNextState, isValidInput } from '../state/logic';
import { generateId } from '../lib/utils';

const INITIAL_STATE: AppContext = {
    state: 'HOME_MENU',
    mode: 'HOME',
    difficultyScores: { trivia: 5, riddle: 5, sudoku: 5 },
    chatHistory: [
        { id: 'init', role: 'bot', content: STATE_CONFIG['HOME_MENU'].message || "Hello!", timestamp: Date.now() }
    ],
    cddCache: {},
    isProcessing: false,
    nonce: 0,
};

function reducer(state: AppContext, action: Action): AppContext {
    switch (action.type) {
        case 'TRANSITION':
            const config = STATE_CONFIG[action.payload];
            return {
                ...state,
                state: action.payload,
                nonce: state.nonce + 1,
                chatHistory: config?.message
                    ? [...state.chatHistory, { id: generateId(), role: 'bot', content: config.message, timestamp: Date.now() }]
                    : state.chatHistory
            };
        case 'SET_MODE':
            return { ...state, mode: action.payload };
        case 'ADD_MESSAGE':
            return { ...state, chatHistory: [...state.chatHistory, action.payload] };
        case 'SET_PROCESSING':
            return { ...state, isProcessing: action.payload };
        case 'INPUT_RECEIVED':
            return {
                ...state,
                chatHistory: [...state.chatHistory, { id: generateId(), role: 'user', content: action.payload, timestamp: Date.now() }]
            };
        case 'SET_VIEWING_DATE':
            return { ...state, viewingDate: action.payload };
        case 'UPDATE_TRIVIA':
            return { ...state, trivia: { ...state.trivia, ...action.payload } as any };
        case 'UPDATE_RIDDLE':
            return { ...state, riddle: { ...state.riddle, ...action.payload } as any };
        case 'UPDATE_SUDOKU':
            return { ...state, sudoku: { ...state.sudoku, ...action.payload } as any };
        case 'CACHE_CDD':
            return { ...state, cddCache: { ...state.cddCache, [action.payload.date]: action.payload.data } };
        default:
            return state;
    }
}

export function useGameState() {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    useEffect(() => {
        // Load local storage
        const saved = localStorage.getItem('uncleSillyState');
        if (saved) {
            try {
                // Dispatch hydrate action? For now just log
                // implementation detail: hydration logic
            } catch (e) {
                console.error("Failed to load state", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('uncleSillyState', JSON.stringify({
            difficultyScores: state.difficultyScores,
            cddCache: state.cddCache
        }));
    }, [state.difficultyScores, state.cddCache]);

    // Auto-fetch CDD when viewingDate changes (if in CDD_VIEW)
    useEffect(() => {
        if (state.state === 'CDD_VIEW') {
            const dateToCheck = state.viewingDate || new Date().toLocaleDateString('en-CA');
            if (!state.cddCache[dateToCheck] && !state.isProcessing) {
                // Trigger fetch
                dispatch({ type: 'SET_PROCESSING', payload: true });
                import('../lib/api').then(m => m.fetchCDD(dateToCheck))
                    .then(data => {
                        dispatch({ type: 'CACHE_CDD', payload: { date: data.date, data } });
                    })
                    .catch(err => {
                        console.error("Failed to fetch archive CDD", err);
                    })
                    .finally(() => {
                        dispatch({ type: 'SET_PROCESSING', payload: false });
                    });
            }
        }
    }, [state.state, state.viewingDate, state.cddCache]);

    const handleInput = useCallback(async (text: string) => {
        if (state.isProcessing) return; // Block input while processing

        // 1. Validate
        if (!isValidInput(state.state, text)) {
            // Reject gracefully? Or just UI shouldn't allow it?
            // Since UI is chips mainly, typed input should be validated before here.
            // But if user types "foo", we respond:
            dispatch({
                type: 'ADD_MESSAGE',
                payload: { id: generateId(), role: 'bot', content: "I didn't catch that. You can type: " + (Array.isArray(STATE_CONFIG[state.state].allowedInput) ? (STATE_CONFIG[state.state].allowedInput as string[]).join(", ") : "valid inputs"), timestamp: Date.now() }
            });
            return;
        }

        // 2. Add User Message
        let displayContent = text;
        if (text.startsWith('ANSWER_')) {
            displayContent = text.replace('ANSWER_', '');
        }
        dispatch({ type: 'INPUT_RECEIVED', payload: displayContent });

        // 3. Determine Transition
        const { nextState, mode, action } = calculateNextState(state.state, text, state);

        if (mode) dispatch({ type: 'SET_MODE', payload: mode });

        if (nextState !== state.state) {
            dispatch({ type: 'TRANSITION', payload: nextState });
        }

        // 4. Handle Side Effects (Fetch)
        if (action && action.startsWith('FETCH_')) {
            dispatch({ type: 'SET_PROCESSING', payload: true });

            // Execute Async
            (async () => {
                try {
                    if (action === 'FETCH_CDD') {
                        // Determine Date to Fetch (Default to Today if not set)
                        const todayKey = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
                        const targetDate = state.viewingDate || todayKey;

                        if (state.cddCache[targetDate]) {
                            // If cached, just transition/display (UI will read from cache)
                            // But for chat-based CDD, we added a message. 
                            // For Archive View, we might just need to ensure it's in cache.
                            // If we are in CDD_VIEW mode, the view reads from cache directly?
                            // Let's keep the ADD_MESSAGE for backward compatibility if we stay in chat mode,
                            // OR if we switch to a VIEW, we don't need to add a message.
                            // DECISION: The new CDD_VIEW will read `state.cddCache[state.viewingDate]`.
                            // So we just need to make sure it IS cached.
                            console.log(`[CDD] Found cache for ${targetDate}`);
                        } else {
                            console.log(`[CDD] Fetching for ${targetDate}`);
                            const data = await import('../lib/api').then(m => m.fetchCDD(targetDate));

                            // Cache it
                            dispatch({ type: 'CACHE_CDD', payload: { date: data.date, data } });

                            // If it's today's CDD (classic flow), maybe still add message?
                            // But if we are in CDD_VIEW, we don't need chat bubble.
                            // Let's add message ONLY if we are NOT in CDD_VIEW (aka legacy/chat access? but CDD button triggers CDD_VIEW now)
                            // Actually, if we are in CDD_VIEW, the component will render the data.
                        }
                    }
                    else if (action === 'FETCH_TRIVIA') {
                        // Determine Category: Use input if it's a valid category, otherwise fallback to current
                        const validCategories = ['ANIMALS', 'SPACE', 'MOVIES', 'SPORTS', 'RANDOM'];
                        let category = state.trivia?.currentCategory || 'RANDOM';

                        const normalizedInput = text.toUpperCase().trim();
                        if (validCategories.includes(normalizedInput)) {
                            category = normalizedInput;
                        }

                        // Fetch Trivia
                        const data = await import('../lib/api').then(m => m.fetchTrivia(category, state.difficultyScores.trivia));

                        dispatch({
                            type: 'UPDATE_TRIVIA',
                            payload: { currentQuestion: data, hasUsedHint: false, currentCategory: category }
                        });
                        dispatch({
                            type: 'ADD_MESSAGE',
                            payload: { id: generateId(), role: 'bot', content: data.question, timestamp: Date.now() }
                        });

                        // Render Choices
                        if (data.choices && Array.isArray(data.choices)) {
                            data.choices.forEach((choice: string, idx: number) => {
                                const label = String.fromCharCode(65 + idx); // A, B, C, D
                                dispatch({
                                    type: 'ADD_MESSAGE',
                                    payload: {
                                        id: generateId(),
                                        role: 'bot',
                                        content: `${label}. ${choice}`,
                                        timestamp: Date.now()
                                    }
                                });
                            });
                        }
                    }
                    else if (action === 'FETCH_RIDDLE') {
                        const data = await import('../lib/api').then(m => m.fetchRiddle(state.difficultyScores.riddle));
                        dispatch({
                            type: 'UPDATE_RIDDLE' as any, // Need to add to Action type if missing, or use generic
                            payload: { currentRiddle: data, hasUsedHint: false }
                        });
                        dispatch({
                            type: 'ADD_MESSAGE',
                            payload: { id: generateId(), role: 'bot', content: data.riddle, timestamp: Date.now() }
                        });

                        // Render Choices (Just like Trivia)
                        if (data.choices && Array.isArray(data.choices)) {
                            data.choices.forEach((choice: string, idx: number) => {
                                const label = String.fromCharCode(65 + idx); // A, B, C, D
                                dispatch({
                                    type: 'ADD_MESSAGE',
                                    payload: {
                                        id: generateId(),
                                        role: 'bot',
                                        content: `${label}. ${choice}`,
                                        timestamp: Date.now()
                                    }
                                });
                            });
                        }
                    }
                    // ... Riddle etc
                } catch (e) {
                    console.error("Fetch failed", e);
                    // Do not add chat message on error. Let the UI handle the error state.
                    // dispatch({
                    //     type: 'ADD_MESSAGE',
                    //     payload: { id: generateId(), role: 'bot', content: "Oops! I couldn't reach my brain. 🧠 Try again later!", timestamp: Date.now() }
                    // });
                } finally {
                    dispatch({ type: 'SET_PROCESSING', payload: false });
                }
            })();
        } else if (action === 'CHECK_TRIVIA') {
            // Robust Logic: Compare last user input with currentQuestion.correctIndex
            const answerMap = ['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D'];

            // Helpful debug log
            if (import.meta.env.DEV) console.log(`CHECK_TRIVIA: Input='${text}'`);

            // Normalize input to ensure we match our internal tokens
            let normalizedText = text.toUpperCase().trim();
            // Map raw A/B/C/D to ANSWER_A/B/C/D if not already done
            if (!normalizedText.startsWith('ANSWER_') && ['A', 'B', 'C', 'D'].includes(normalizedText)) {
                normalizedText = `ANSWER_${normalizedText}`;
            }

            const effectiveIdx = answerMap.indexOf(normalizedText);
            const correctIdx = state.trivia?.currentQuestion?.correctIndex;
            const isCorrect = effectiveIdx === correctIdx;

            const choices = ['A', 'B', 'C', 'D'];
            const correctLetter = choices[correctIdx || 0];
            const explanation = state.trivia?.currentQuestion?.explanation || "No explanation provided.";

            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    id: generateId(),
                    role: 'bot',
                    content: isCorrect
                        ? `✅ **Correct!**\n\n${explanation}`
                        : `❌ **Not quite.** The answer was **${correctLetter}**.\n\n${explanation}`,
                    timestamp: Date.now()
                }
            });

        } else if (action === 'CHECK_RIDDLE') {
            const answerMap = ['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D'];

            // Normalize input - mirroring robust Trivia logic
            let normalizedText = text.toUpperCase().trim();
            if (!normalizedText.startsWith('ANSWER_') && ['A', 'B', 'C', 'D'].includes(normalizedText)) {
                normalizedText = `ANSWER_${normalizedText}`;
            }

            const effectiveIdx = answerMap.indexOf(normalizedText);
            const correctIdx = state.riddle?.currentRiddle?.correctIndex;
            const isCorrect = effectiveIdx === correctIdx;

            const choices = ['A', 'B', 'C', 'D'];
            const correctLetter = choices[correctIdx || 0];
            const explanation = state.riddle?.currentRiddle?.explanation || "A mystery indeed!";

            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    id: generateId(),
                    role: 'bot',
                    content: isCorrect
                        ? `✨ **Brilliant!**\n\n${explanation}`
                        : `🤔 **Good guess!** The answer was **${correctLetter}**.\n\n${explanation}`,
                    timestamp: Date.now()
                }
            });

        } else if (action && (action as string).startsWith('START_SUDOKU')) {
            // Handle Synchronous Sudoku Init
            const difficulty = (action as string).split('_')[2].toLowerCase(); // EASY, MEDIUM, HARD
            dispatch({
                type: 'UPDATE_SUDOKU',
                payload: {
                    difficulty: difficulty as any,
                    board: [],
                    initialBoard: [],
                    notes: [],
                    history: []
                }
            });
        }
    }, [state]);

    return { state, dispatch, handleInput };
}
