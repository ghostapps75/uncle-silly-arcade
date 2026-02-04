export type AppMode = 'HOME' | 'CDD' | 'TRIVIA' | 'RIDDLE' | 'SUDOKU';

export type GameState =
    | 'HOME_MENU'
    | 'CDD_VIEW'
    | 'TRIVIA_MENU'
    | 'TRIVIA_QUESTION'
    | 'TRIVIA_FEEDBACK'
    | 'RIDDLE_MENU'
    | 'RIDDLE_PROMPT'
    | 'RIDDLE_FEEDBACK'
    | 'SUDOKU_MENU'
    | 'SUDOKU_PLAY'
    | 'SETTINGS';

export interface QuickReply {
    label: string;
    value: string; // The simpler token to process (e.g. "A", "MENU", "HINT")
    color?: 'brand-primary' | 'brand-secondary' | 'gray';
}

export interface ChatMessage {
    id: string;
    role: 'bot' | 'user';
    content: string; // HTML string or plain text
    timestamp: number;
}

export interface SudokuState {
    board: number[][]; // 9x9 containing 0-9 (0 = empty)
    initialBoard: number[][]; // To know which are fixed
    notes: number[][][]; // 9x9 array of number[] candidates
    history: number[][][]; // Undo stack
    difficulty: 'easy' | 'medium' | 'hard';
    startTime: number;
    hintsUsed: number;
}

export interface TriviaState {
    currentQuestion?: {
        question: string;
        choices: string[];
        correctIndex: number; // 0-3
        explanation: string;
        hint: string;
    };
    hasUsedHint: boolean;
    streak: number;
}

export interface RiddleState {
    currentRiddle?: {
        riddle: string;
        choices: string[];
        correctIndex: number;
        hint: string;
        explanation: string;
    };
    hasUsedHint: boolean;
}

export interface AppContext {
    state: GameState;
    mode: AppMode;

    // persistent user stats
    difficultyScores: {
        trivia: number; // 0-10
        riddle: number; // 0-10
        sudoku: number; // 0-10
    };

    // session state
    chatHistory: ChatMessage[];

    // feature states
    sudoku?: SudokuState;
    trivia?: TriviaState;
    riddle?: RiddleState;

    // data cache
    cddCache: Record<string, any>; // cached daily debriefs

    // flags
    isProcessing: boolean; // showing typing indicator
    nonce: number; // For async race condition handling
}

export type Action =
    | { type: 'TRANSITION'; payload: GameState }
    | { type: 'SET_MODE'; payload: AppMode }
    | { type: 'ADD_MESSAGE'; payload: ChatMessage }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'UPDATE_SUDOKU'; payload: Partial<SudokuState> }
    | { type: 'UPDATE_TRIVIA'; payload: Partial<TriviaState> }
    | { type: 'UPDATE_RIDDLE'; payload: Partial<RiddleState> }
    | { type: 'CACHE_CDD'; payload: { date: string, data: any } }
    | { type: 'LOAD_CDD'; payload: { date: string, data: any } }
    | { type: 'INPUT_RECEIVED'; payload: string };
