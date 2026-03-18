import type { AppContext, GameState, AppMode } from "./types";
import { STATE_CONFIG } from "./machine";

export function isValidInput(state: GameState, input: string): boolean {
    const config = STATE_CONFIG[state];
    if (!config) return false;

    const normalized = input.toUpperCase().trim();

    if (state === 'TRIVIA_QUESTION' && ['A', 'B', 'C', 'D'].includes(normalized)) {
        const mapped = `ANSWER_${normalized}`;
        if (Array.isArray(config.allowedInput) && config.allowedInput.includes(mapped)) return true;
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
    action?: string;
} {
    let token = input.toUpperCase().trim();

    if (currentState === 'TRIVIA_QUESTION' && ['A', 'B', 'C', 'D'].includes(token)) {
        token = `ANSWER_${token}`;
    }

    if (token === 'MENU') return { nextState: 'HOME_MENU', mode: 'HOME' };

    switch (currentState) {
        case 'HOME_MENU':
            if (token === 'CDD')    return { nextState: 'CDD_VIEW',               mode: 'CDD',    action: 'FETCH_CDD' };
            if (token === 'TRIVIA') return { nextState: 'TRIVIA_DIFFICULTY_MENU', mode: 'TRIVIA' };
            if (token === 'SUDOKU') return { nextState: 'SUDOKU_MENU',            mode: 'SUDOKU' };
            break;

        case 'CDD_VIEW':
            break;

        case 'TRIVIA_DIFFICULTY_MENU':
            if (token === 'EASY' || token === 'HARD') {
                return { nextState: 'TRIVIA_MENU', action: `SET_TRIVIA_DIFFICULTY_${token}` };
            }
            break;

        case 'TRIVIA_MENU':
            if (['ANIMALS', 'SPACE', 'MOVIES', 'SPORTS', 'RANDOM'].includes(token)) {
                return { nextState: 'TRIVIA_QUESTION', action: 'FETCH_TRIVIA' };
            }
            break;

        case 'TRIVIA_QUESTION':
            if (['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D'].includes(token)) {
                return { nextState: 'TRIVIA_FEEDBACK', action: 'CHECK_TRIVIA' };
            }
            if (token === 'HINT') return { nextState: 'TRIVIA_QUESTION', action: 'NONE' };
            break;

        case 'TRIVIA_FEEDBACK':
            if (token === 'NEXT') return { nextState: 'TRIVIA_QUESTION', action: 'FETCH_TRIVIA' };
            break;

        case 'SUDOKU_MENU':
            if (['EASY', 'MEDIUM', 'HARD'].includes(token)) {
                return { nextState: 'SUDOKU_PLAY', action: `START_SUDOKU_${token}` };
            }
            break;

        case 'SUDOKU_PLAY':
            if (token === 'NEW') return { nextState: 'SUDOKU_MENU' };
            break;
    }

    return { nextState: currentState, action: 'NONE' };
}
