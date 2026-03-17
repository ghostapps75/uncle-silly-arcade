import { getSudoku } from 'sudoku-gen';

export type Board = number[][];

export function createEmptyBoard(): Board {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function stringToBoard(str: string): Board {
    const board = createEmptyBoard();
    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const char = str[i];
        board[row][col] = char === '-' ? 0 : parseInt(char, 10);
    }
    return board;
}

export function generateSudoku(difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium'): { puzzle: Board, solution: Board } {
    const sudoku = getSudoku(difficulty);
    return {
        puzzle: stringToBoard(sudoku.puzzle),
        solution: stringToBoard(sudoku.solution)
    };
}
