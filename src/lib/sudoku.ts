export type Board = number[][];

export function createEmptyBoard(): Board {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isValid(board: Board, row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
        const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const boxCol = 3 * Math.floor(col / 3) + (i % 3);
        if (board[boxRow][boxCol] === num) return false;
    }
    return true;
}

export function solve(board: Board, countOnly = false, limit = 1): number | boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                let solutionsFound = 0;
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5); // Randomize for generator

                for (const num of nums) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;

                        if (countOnly) {
                            const res = solve(board, true, limit);
                            solutionsFound += (res as number);
                            if (solutionsFound >= limit) {
                                board[row][col] = 0; // backtrack
                                return solutionsFound;
                            }
                        } else {
                            if (solve(board)) return true;
                        }

                        board[row][col] = 0;
                    }
                }
                return countOnly ? solutionsFound : false;
            }
        }
    }
    return countOnly ? 1 : true;
}

export function generateSudoku(difficulty: 'easy' | 'medium' | 'hard'): { puzzle: Board, solution: Board } {
    // 1. Generate full board
    const solution = createEmptyBoard();
    solve(solution);
    const puzzle = solution.map(row => [...row]);

    // 2. Remove cells based on difficulty
    let attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;
    while (attempts > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            const backup = puzzle[row][col];
            puzzle[row][col] = 0;

            // Check uniqueness
            const copy = puzzle.map(r => [...r]);
            const solutions = solve(copy, true, 2);

            if (solutions !== 1) {
                puzzle[row][col] = backup; // Put back if not unique
            }
        }
        attempts--;
    }

    return { puzzle, solution };
}
