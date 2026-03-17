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
    const puzzleBoard = stringToBoard(sudoku.puzzle);
    const solutionBoard = stringToBoard(sudoku.solution);

    // Make 'easy' and 'medium' actually noticeably easier by revealing extra clues randomly
    let extraClues = 0;
    if (difficulty === 'easy') extraClues = 15; // +15 clues makes it very easy (~53 total clues)
    if (difficulty === 'medium') extraClues = 8; // +8 clues makes it a gentle medium (~38 total clues)

    if (extraClues > 0) {
        const emptyCells: {r: number, c: number}[] = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (puzzleBoard[r][c] === 0) {
                    emptyCells.push({r, c});
                }
            }
        }
        
        // Shuffle using Fisher-Yates
        for (let i = emptyCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
        }
        
        const toReveal = Math.min(extraClues, emptyCells.length);
        for (let i = 0; i < toReveal; i++) {
            const cell = emptyCells[i];
            puzzleBoard[cell.r][cell.c] = solutionBoard[cell.r][cell.c];
        }
    }

    return {
        puzzle: puzzleBoard,
        solution: solutionBoard
    };
}
