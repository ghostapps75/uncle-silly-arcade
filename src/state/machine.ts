import type { GameState, QuickReply } from "./types";

interface StateConfig {
    allowedInput: RegExp | string[]; // Regex for validation OR list of exact tokens
    replies: QuickReply[];
    message?: string; // Static message from Uncle Silly on entry (if not async)
}

export const STATE_CONFIG: Record<GameState, StateConfig> = {
    HOME_MENU: {
        allowedInput: ['CDD', 'TRIVIA', 'RIDDLES', 'SUDOKU', 'PARENT'],
        replies: [
            { label: "Casey's Daily Debrief", value: "CDD", color: 'brand-primary' },
            { label: "Trivia", value: "TRIVIA", color: 'brand-secondary' },
            { label: "Riddles", value: "RIDDLES", color: 'brand-secondary' },
            { label: "Sudoku", value: "SUDOKU", color: 'brand-primary' },
        ],
        message: "Hi Casey! What do you want to do today?"
    },
    CDD_VIEW: {
        allowedInput: ['MENU', 'THANKS'],
        replies: [
            { label: "Main Menu", value: "MENU", color: 'gray' }
        ]
    },
    TRIVIA_MENU: {
        allowedInput: ['ANIMALS', 'SPACE', 'MOVIES', 'SPORTS', 'RANDOM', 'MENU'],
        replies: [ // Categories
            { label: "Animals", value: "ANIMALS" },
            { label: "Space", value: "SPACE" },
            { label: "Movies & TV", value: "MOVIES" },
            { label: "Sports", value: "SPORTS" },
            { label: "Random", value: "RANDOM" },
            { label: "Back", value: "MENU", color: 'gray' },
        ],
        message: "Pick a category for Trivia!"
    },
    TRIVIA_QUESTION: {
        allowedInput: ['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D', 'HINT', 'MENU'],
        replies: [
            { label: "A", value: "ANSWER_A" },
            { label: "B", value: "ANSWER_B" },
            { label: "C", value: "ANSWER_C" },
            { label: "D", value: "ANSWER_D" },
            { label: "Hint", value: "HINT", color: 'gray' },
            { label: "Menu", value: "MENU", color: 'gray' },
        ]
    },
    TRIVIA_FEEDBACK: {
        allowedInput: ['HARDER', 'EASIER', 'SAME', 'MENU', 'NEXT'],
        replies: [
            { label: "Next Question", value: "NEXT", color: 'brand-primary' },
            { label: "Harder", value: "HARDER" },
            { label: "Easier", value: "EASIER" },
            { label: "Same", value: "SAME" },
            { label: "Menu", value: "MENU", color: 'gray' },
        ]
    },
    RIDDLE_MENU: {
        allowedInput: ['START', 'MENU'],
        replies: [
            { label: "Start Riddles", value: "START", color: 'brand-primary' },
            { label: "Menu", value: "MENU", color: 'gray' },
        ]
    },
    RIDDLE_PROMPT: {
        allowedInput: ['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D', 'HINT', 'MENU'],
        replies: [
            { label: "A", value: "ANSWER_A" },
            { label: "B", value: "ANSWER_B" },
            { label: "C", value: "ANSWER_C" },
            { label: "D", value: "ANSWER_D" },
            { label: "Hint", value: "HINT", color: 'gray' },
            { label: "Menu", value: "MENU", color: 'gray' },
        ]
    },
    RIDDLE_FEEDBACK: {
        allowedInput: ['HARDER', 'EASIER', 'SAME', 'MENU', 'NEXT'],
        replies: [
            { label: "Next Riddle", value: "NEXT", color: 'brand-primary' },
            { label: "Harder", value: "HARDER" },
            { label: "Easier", value: "EASIER" },
            { label: "Same", value: "SAME" },
            { label: "Menu", value: "MENU", color: 'gray' },
        ]
    },
    SUDOKU_MENU: {
        allowedInput: ['EASY', 'MEDIUM', 'HARD', 'MENU'],
        replies: [
            { label: "Easy", value: "EASY", color: 'brand-secondary' },
            { label: "Medium", value: "MEDIUM", color: 'brand-primary' },
            { label: "Hard", value: "HARD", color: 'brand-secondary' },
            { label: "Back", value: "MENU", color: 'gray' },
        ],
        message: "Select Sudoku difficulty:"
    },
    SUDOKU_PLAY: {
        allowedInput: ['MENU', 'NEW'],
        replies: [
            { label: "Menu", value: "MENU", color: 'gray' },
            { label: "New Game", value: "NEW", color: 'gray' },
        ]
    },
    SETTINGS: {
        allowedInput: ['MENU', 'CLEAR'],
        replies: [
            { label: "Back", value: "MENU" }
        ]
    }
};
