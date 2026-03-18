import type { GameState, QuickReply } from "./types";

interface StateConfig {
    allowedInput: RegExp | string[];
    replies: QuickReply[];
    message?: string;
}

export const STATE_CONFIG: Record<GameState, StateConfig> = {
    HOME_MENU: {
        allowedInput: ['CDD', 'TRIVIA', 'SUDOKU'],
        replies: [
            { label: "Casey's Daily Debrief", value: "CDD", color: 'brand-primary' },
            { label: "Trivia", value: "TRIVIA", color: 'brand-secondary' },
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

    TRIVIA_DIFFICULTY_MENU: {
        allowedInput: ['EASY', 'HARD', 'MENU'],
        replies: [
            { label: "🟢 Easy  (Ages 11 & Under)", value: "EASY", color: 'brand-secondary' },
            { label: "🔴 Hard  (Ages 12 & Up)",    value: "HARD", color: 'brand-primary' },
            { label: "Back", value: "MENU", color: 'gray' },
        ],
        message: "Choose your trivia difficulty:"
    },

    TRIVIA_MENU: {
        allowedInput: ['ANIMALS', 'SPACE', 'MOVIES', 'SPORTS', 'RANDOM', 'MENU'],
        replies: [
            { label: "🐾 Animals",     value: "ANIMALS" },
            { label: "🚀 Space",       value: "SPACE" },
            { label: "🎬 Movies & TV", value: "MOVIES" },
            { label: "⚽ Sports",      value: "SPORTS" },
            { label: "🎲 Random",      value: "RANDOM" },
            { label: "Back", value: "MENU", color: 'gray' },
        ],
        message: "Pick a category:"
    },

    TRIVIA_QUESTION: {
        allowedInput: ['ANSWER_A', 'ANSWER_B', 'ANSWER_C', 'ANSWER_D', 'HINT', 'MENU'],
        replies: [] // Handled by TriviaView card UI – no chip bar needed
    },
    TRIVIA_FEEDBACK: {
        allowedInput: ['NEXT', 'MENU'],
        replies: [] // Handled by TriviaView card UI
    },

    SUDOKU_MENU: {
        allowedInput: ['EASY', 'MEDIUM', 'HARD', 'MENU'],
        replies: [
            { label: "Easy",   value: "EASY",   color: 'brand-secondary' },
            { label: "Medium", value: "MEDIUM", color: 'brand-primary' },
            { label: "Hard",   value: "HARD",   color: 'brand-secondary' },
            { label: "Back",   value: "MENU",   color: 'gray' },
        ],
        message: "Select Sudoku difficulty:"
    },
    SUDOKU_PLAY: {
        allowedInput: ['MENU', 'NEW'],
        replies: [
            { label: "Menu",     value: "MENU", color: 'gray' },
            { label: "New Game", value: "NEW",  color: 'gray' },
        ]
    },
    SETTINGS: {
        allowedInput: ['MENU', 'CLEAR'],
        replies: [
            { label: "Back", value: "MENU" }
        ]
    }
};
