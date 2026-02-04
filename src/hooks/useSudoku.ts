import { useEffect, useCallback, useState, useRef } from 'react';
import type { SudokuState } from '../state/types';

// Helper to interact with the main reducer
interface UseSudokuProps {
    state: SudokuState | undefined; // From AppContext
    dispatch: React.Dispatch<any>;
}

export function useSudoku({ state, dispatch }: UseSudokuProps) {
    const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
    const [isNotesMode, setIsNotesMode] = useState(false);

    // Worker ref & State
    const workerRef = useRef<Worker | null>(null);
    const [workerReady, setWorkerReady] = useState(false);

    // Initialize Worker
    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/sudoku.worker.ts', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (e) => {
            const { puzzle } = e.data;
            if (import.meta.env.DEV) console.log("Worker returned puzzle:", puzzle);

            // Dispatch Init
            dispatch({
                type: 'UPDATE_SUDOKU',
                payload: {
                    board: puzzle,
                    initialBoard: puzzle.map((r: number[]) => [...r]),
                    notes: Array(9).fill(0).map(() => Array(9).fill([])),
                    history: [],
                    startTime: Date.now()
                }
            });
        };

        workerRef.current.onerror = (e) => {
            console.error("Sudoku Worker Error:", e);
        };

        setWorkerReady(true);

        return () => {
            workerRef.current?.terminate();
        };
    }, [dispatch]);

    // Generate Helper
    const generateNewGame = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
        if (workerRef.current) {
            console.log("Generating Sudoku:", difficulty);
            workerRef.current.postMessage({ difficulty });
        }
    }, []);

    // Auto-start if board is empty
    useEffect(() => {
        if (workerReady && state && state.board.length === 0) {
            generateNewGame(state.difficulty);
        }
    }, [workerReady, state?.board.length, state?.difficulty, generateNewGame]);

    // Controls
    const handleCellClick = (r: number, c: number) => {
        setActiveCell([r, c]);
    };

    const handleNumberInput = useCallback((num: number) => {
        if (!activeCell || !state) return;
        const [r, c] = activeCell;

        // Check if initial
        if (state.initialBoard[r][c] !== 0) return;

        if (isNotesMode) {
            // Toggle Note
            const currentNotes = state.notes[r][c];
            const newNotes = currentNotes.includes(num)
                ? currentNotes.filter(n => n !== num)
                : [...currentNotes, num].sort();

            const nextNotes = state.notes.map((row, i) =>
                row.map((cell, j) => (i === r && j === c ? newNotes : cell))
            );

            dispatch({ type: 'UPDATE_SUDOKU', payload: { notes: nextNotes } });
        } else {
            // Set Value
            const nextBoard = state.board.map((row, i) =>
                row.map((cell, j) => (i === r && j === c ? num : cell))
            );
            // Push History
            const newHistory = [...state.history, state.board];
            dispatch({ type: 'UPDATE_SUDOKU', payload: { board: nextBoard, history: newHistory } });
        }
    }, [activeCell, isNotesMode, state, dispatch]);

    const handleErase = useCallback(() => {
        if (!activeCell || !state) return;
        const [r, c] = activeCell;
        if (state.initialBoard[r][c] !== 0) return;

        if (state.board[r][c] !== 0) {
            // Clear value
            const nextBoard = state.board.map((row, i) =>
                row.map((cell, j) => (i === r && j === c ? 0 : cell))
            );
            dispatch({ type: 'UPDATE_SUDOKU', payload: { board: nextBoard } });
        } else {
            // Clear notes
            const nextNotes = state.notes.map((row, i) =>
                row.map((cell, j) => (i === r && j === c ? [] : cell))
            );
            dispatch({ type: 'UPDATE_SUDOKU', payload: { notes: nextNotes } });
        }
    }, [activeCell, state, dispatch]);

    const handleUndo = () => {
        if (!state || state.history.length === 0) return;
        const previous = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        dispatch({ type: 'UPDATE_SUDOKU', payload: { board: previous, history: newHistory } });
    };

    // Keyboard Handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!activeCell) return;
            const [r, c] = activeCell;

            // Move
            if (e.key === 'ArrowUp') setActiveCell([Math.max(0, r - 1), c]);
            if (e.key === 'ArrowDown') setActiveCell([Math.min(8, r + 1), c]);
            if (e.key === 'ArrowLeft') setActiveCell([r, Math.max(0, c - 1)]);
            if (e.key === 'ArrowRight') setActiveCell([r, Math.min(8, c + 1)]);

            // Input
            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key));
            }
            if (e.key === 'Backspace' || e.key === 'Delete') {
                handleErase();
            }
            if (e.key.toLowerCase() === 'n') {
                setIsNotesMode(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeCell, handleNumberInput, handleErase]);

    return {
        activeCell,
        isNotesMode,
        setIsNotesMode,
        handleCellClick,
        handleNumberInput,
        handleUndo,
        handleErase,
        generateNewGame
    };
}
