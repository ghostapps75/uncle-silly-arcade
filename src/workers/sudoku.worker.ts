import { generateSudoku } from '../lib/sudoku';

self.onmessage = (e: MessageEvent) => {
    const { difficulty } = e.data;
    const result = generateSudoku(difficulty);
    self.postMessage(result);
};
