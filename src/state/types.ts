export type AppMode = 'HOME' | 'CDD' | 'TRIVIA' | 'SUDOKU';

export type GameState =
    | 'HOME_MENU'
    | 'CDD_VIEW'
    | 'TRIVIA_DIFFICULTY_MENU'
    | 'TRIVIA_MENU'
    | 'TRIVIA_QUESTION'
    | 'TRIVIA_FEEDBACK'
    | 'SUDOKU_MENU'
    | 'SUDOKU_PLAY'
    | 'SETTINGS';

export interface QuickReply {
    label: string;
    value: string;
    color?: 'brand-primary' | 'brand-secondary' | 'gray';
}

export interface ChatMessage {
    id: string;
    role: 'bot' | 'user';
    content: string;
    timestamp: number;
}

export interface SudokuState {
    board: number[][];
    initialBoard: number[][];
    notes: number[][][];
    history: number[][][];
    difficulty: 'easy' | 'medium' | 'hard';
    startTime: number;
    hintsUsed: number;
}

export interface TriviaState {
    currentQuestion?: {
        question: string;
        choices: string[];
        correctIndex: number;
        explanation: string;
        hint: string;
    };
    lastResult?: {
        isCorrect: boolean;
        correctIndex: number;
        explanation: string;
    };
    hasUsedHint: boolean;
    streak: number;
    currentCategory?: string;
    selectedDifficulty?: 'EASY' | 'HARD';
    recentQuestions: string[];
}

export interface AppContext {
    state: GameState;
    mode: AppMode;

    difficultyScores: {
        trivia: number;
        sudoku: number;
    };

    chatHistory: ChatMessage[];

    sudoku?: SudokuState;
    trivia?: TriviaState;

    cddCache: Record<string, any>;

    isProcessing: boolean;
    nonce: number;
    viewingDate?: string;
}

export type Action =
    | { type: 'TRANSITION'; payload: GameState }
    | { type: 'SET_MODE'; payload: AppMode }
    | { type: 'ADD_MESSAGE'; payload: ChatMessage }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'UPDATE_SUDOKU'; payload: Partial<SudokuState> }
    | { type: 'UPDATE_TRIVIA'; payload: Partial<TriviaState> }
    | { type: 'CACHE_CDD'; payload: { date: string, data: any } }
    | { type: 'LOAD_CDD'; payload: { date: string, data: any } }
    | { type: 'SET_VIEWING_DATE'; payload: string }
    | { type: 'INPUT_RECEIVED'; payload: string };
