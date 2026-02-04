import type { AppContext, GameState, AppMode } from "./types";
import { STATE_CONFIG } from "./machine";

export function isValidInput(state: GameState, input: string): boolean {
    const config = STATE_CONFIG[state];
    if (!config) return false;

    // Normalization Policy: Trim and Uppercase ALL input before validation.
    const normalized = input.toUpperCase().trim();

    // Context-Sensitive Normalization
    if (state === 'TRIVIA_QUESTION' && ['A', 'B', 'C', 'D'].includes(normalized)) {
        const mapped = `ANSWER_${normalized}`;
        if (Array.isArray(config.allowedInput)) {
            // Check if MAPPED value is allowed (ANSWER_A)
            if (config.allowedInput.includes(mapped)) return true;
        }
    }

    if (Array.isArray(config.allowedInput)) {
        return config.allowedInput.includes(normalized);
    }
    return config.allowedInput.test(normalized);
}

export function calculateNextState(
    currentState: GameState,
    input: string,
    _context: AppContext
): {
    nextState: GameState;
    mode?: AppMode;
    action?: 'FETCH_CDD' | 'FETCH_TRIVIA' | 'FETCH_RIDDLE' | 'CHECK_TRIVIA' | 'CHECK_RIDDLE' | 'NONE' | string
} {
    let token = input.toUpperCase().trim();

    // Input Mapping for Trivia Answer
    if ((currentState === 'TRIVIA_QUESTION' || currentState === 'RIDDLE_PROMPT') && ['A', 'B', 'C', 'D'].includes(token)) {
        token = `ANSWER_${token}`;
    }

    // Global Navigation
    if (token === 'MENU') return { nextState: 'HOME_MENU', mode: 'HOME' };

    switch (currentState) {
        case 'HOME_MENU':
            if (token === 'CDD') return { nextState: 'CDD_VIEW', mode: 'CDD', action: 'FETCH_CDD' };
            if (token === 'TRIVIA') return { nextState: 'TRIVIA_MENU', mode: 'TRIVIA' };
            if (token === 'RIDDLES') return { nextState: 'RIDDLE_MENU', mode: 'RIDDLE' };
            if (token === 'SUDOKU') return { nextState: 'SUDOKU_MENU', mode: 'SUDOKU' };
            // PARENT?
            break;

        case 'CDD_VIEW':
            // MENU handled globally
            break;

        case 'TRIVIA_MENU':
            if (['ANIMALS', 'SPACE', 'MOVIES', 'SPORTS', 'RANDOM'].includes(token)) {
                return { nextState: 'TRIVIA_QUESTION', action: 'FETCH_TRIVIA' }; // Context update needed for category
            }
            break;

        case 'TRIVIA_QUESTION':
            if (['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D'].includes(token)) {
                return { nextState: 'TRIVIA_FEEDBACK', action: 'CHECK_TRIVIA' };
            }
            if (token === 'HINT') return { nextState: 'TRIVIA_QUESTION', action: 'NONE' }; // Hint handled by UI toggle
            break;

        case 'TRIVIA_FEEDBACK':
            if (token === 'NEXT') return { nextState: 'TRIVIA_QUESTION', action: 'FETCH_TRIVIA' };
            if (['HARDER', 'EASIER', 'SAME'].includes(token)) {
                return { nextState: 'TRIVIA_QUESTION', action: 'FETCH_TRIVIA' }; // Difficulty update side effect
            }
            break;

        case 'RIDDLE_MENU':
            if (token === 'START') return { nextState: 'RIDDLE_PROMPT', action: 'FETCH_RIDDLE' };
            break;

        case 'RIDDLE_PROMPT':
            if (['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D'].includes(token)) {
                return { nextState: 'RIDDLE_FEEDBACK', action: 'CHECK_RIDDLE' };
            }
            break;

        case 'RIDDLE_FEEDBACK':
            if (token === 'NEXT') return { nextState: 'RIDDLE_PROMPT', action: 'FETCH_RIDDLE' };
            if (['HARDER', 'EASIER', 'SAME'].includes(token)) {
                return { nextState: 'RIDDLE_PROMPT', action: 'FETCH_RIDDLE' };
            }
            break;

        case 'SUDOKU_MENU':
            if (['EASY', 'MEDIUM', 'HARD'].includes(token)) {
                // We need to pass the difficulty to the state
                // Action will be used by useGameState to set difficulty in context
                return { nextState: 'SUDOKU_PLAY', action: `START_SUDOKU_${token}` as any };
            }
            break;

        case 'SUDOKU_PLAY':
            if (token === 'NEW') return { nextState: 'SUDOKU_MENU' };
            break;
    }

    return { nextState: currentState, action: 'NONE' };
}
