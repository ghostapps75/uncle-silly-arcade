import { useReducer, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import type { AppContext, Action } from '../state/types';
import { STATE_CONFIG } from '../state/machine';
import { calculateNextState, isValidInput } from '../state/logic';
import { generateId } from '../lib/utils';

const INITIAL_STATE: AppContext = {
    state: 'HOME_MENU',
    mode: 'HOME',
    difficultyScores: { trivia: 5, sudoku: 5 },
    chatHistory: [
        { id: 'init', role: 'bot', content: STATE_CONFIG['HOME_MENU'].message || "Hello!", timestamp: Date.now() }
    ],
    cddCache: {},
    isProcessing: false,
    nonce: 0,
};

function reducer(state: AppContext, action: Action): AppContext {
    switch (action.type) {
        case 'TRANSITION': {
            const config = STATE_CONFIG[action.payload];
            return {
                ...state,
                state: action.payload,
                nonce: state.nonce + 1,
                chatHistory: config?.message
                    ? [...state.chatHistory, { id: generateId(), role: 'bot', content: config.message, timestamp: Date.now() }]
                    : state.chatHistory
            };
        }
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
        localStorage.setItem('uncleSillyState', JSON.stringify({
            difficultyScores: state.difficultyScores,
            cddCache: state.cddCache
        }));
    }, [state.difficultyScores, state.cddCache]);

    // Auto-fetch CDD when viewingDate changes
    useEffect(() => {
        if (state.state === 'CDD_VIEW') {
            const dateToCheck = state.viewingDate || format(new Date(), 'yyyy-MM-dd');
            if (!state.cddCache[dateToCheck] && !state.isProcessing) {
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
        if (state.isProcessing) return;

        if (!isValidInput(state.state, text)) {
            dispatch({
                type: 'ADD_MESSAGE',
                payload: { id: generateId(), role: 'bot', content: "I didn't catch that. Please use the buttons!", timestamp: Date.now() }
            });
            return;
        }

        // Only add user message to chat for non-card states
        const isCardState = ['TRIVIA_QUESTION', 'TRIVIA_FEEDBACK', 'SUDOKU_PLAY'].includes(state.state);
        if (!isCardState) {
            let displayContent = text;
            if (text.startsWith('ANSWER_')) displayContent = text.replace('ANSWER_', '');
            dispatch({ type: 'INPUT_RECEIVED', payload: displayContent });
        }

        const { nextState, mode, action } = calculateNextState(state.state, text, state);

        if (mode) dispatch({ type: 'SET_MODE', payload: mode });
        if (nextState !== state.state) dispatch({ type: 'TRANSITION', payload: nextState });

        // ── Set trivia difficulty ────────────────────────────────────────────
        if (action && action.startsWith('SET_TRIVIA_DIFFICULTY_')) {
            const diff = action.replace('SET_TRIVIA_DIFFICULTY_', '') as 'EASY' | 'HARD';
            dispatch({ type: 'UPDATE_TRIVIA', payload: { selectedDifficulty: diff } });
        }

        // ── Async fetches ────────────────────────────────────────────────────
        if (action && action.startsWith('FETCH_')) {
            dispatch({ type: 'SET_PROCESSING', payload: true });

            (async () => {
                try {
                    if (action === 'FETCH_CDD') {
                        const todayKey = format(new Date(), 'yyyy-MM-dd');
                        const targetDate = state.viewingDate || todayKey;
                        if (!state.cddCache[targetDate]) {
                            const data = await import('../lib/api').then(m => m.fetchCDD(targetDate));
                            dispatch({ type: 'CACHE_CDD', payload: { date: data.date, data } });
                        }
                    }
                    else if (action === 'FETCH_TRIVIA') {
                        const validCategories = ['ANIMALS', 'SPACE', 'MOVIES', 'SPORTS', 'RANDOM'];
                        let category = state.trivia?.currentCategory || 'RANDOM';
                        const normalizedInput = text.toUpperCase().trim();
                        if (validCategories.includes(normalizedInput)) category = normalizedInput;

                        const mode = state.trivia?.selectedDifficulty || 'EASY';
                        const difficultyScore = mode === 'HARD' ? 10 : 5;
                        const recentQuestions = state.trivia?.recentQuestions || [];

                        const data = await import('../lib/api').then(m => m.fetchTrivia(category, difficultyScore, recentQuestions));

                        const updatedRecent = [...recentQuestions, data.question].slice(-10);

                        dispatch({
                            type: 'UPDATE_TRIVIA',
                            payload: {
                                currentQuestion: data,
                                lastResult: undefined,
                                hasUsedHint: false,
                                currentCategory: category,
                                recentQuestions: updatedRecent
                            }
                        });
                        // No chat messages for trivia – TriviaView card handles display
                    }
                } catch (e) {
                    console.error("Fetch failed", e);
                    if (action === 'FETCH_TRIVIA') {
                        // Can't show chat messages in TRIVIA card state — go back to menu instead
                        dispatch({ type: 'TRANSITION', payload: 'TRIVIA_MENU' });
                        dispatch({
                            type: 'ADD_MESSAGE',
                            payload: { id: generateId(), role: 'bot', content: "⚠️ Couldn't load a question. Check your connection and try again!", timestamp: Date.now() }
                        });
                    } else {
                        dispatch({
                            type: 'ADD_MESSAGE',
                            payload: { id: generateId(), role: 'bot', content: "Oops! I couldn't reach my brain. 🧠 Check your connection and try again!", timestamp: Date.now() }
                        });
                    }
                } finally {
                    dispatch({ type: 'SET_PROCESSING', payload: false });
                }
            })();
        }

        // ── Check trivia answer ──────────────────────────────────────────────
        else if (action === 'CHECK_TRIVIA') {
            const answerMap = ['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D'];
            let normalized = text.toUpperCase().trim();
            if (!normalized.startsWith('ANSWER_') && ['A', 'B', 'C', 'D'].includes(normalized)) {
                normalized = `ANSWER_${normalized}`;
            }
            const effectiveIdx = answerMap.indexOf(normalized);
            const correctIdx = state.trivia?.currentQuestion?.correctIndex ?? 0;
            const isCorrect = effectiveIdx === correctIdx;
            const explanation = state.trivia?.currentQuestion?.explanation || '';

            dispatch({
                type: 'UPDATE_TRIVIA',
                payload: {
                    lastResult: { isCorrect, correctIndex: correctIdx, explanation },
                    streak: isCorrect ? (state.trivia?.streak || 0) + 1 : 0,
                }
            });
            // No chat messages for trivia – TriviaView card handles display
        }

        // ── Sudoku init ──────────────────────────────────────────────────────
        else if (action && action.startsWith('START_SUDOKU')) {
            const difficulty = action.split('_')[2].toLowerCase();
            dispatch({
                type: 'UPDATE_SUDOKU',
                payload: { difficulty: difficulty as any, board: [], initialBoard: [], notes: [], history: [] }
            });
        }
    }, [state]);

    return { state, dispatch, handleInput };
}
