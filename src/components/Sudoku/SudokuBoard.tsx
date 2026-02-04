
import { cn } from '../../lib/utils'; // Assuming utils exists

interface SudokuBoardProps {
    board: number[][];
    initialBoard: number[][]; // To lock initial cells
    notes: number[][][];
    activeCell: [number, number] | null;
    onCellClick: (row: number, col: number) => void;
    onValueInput: (value: number, isNote: boolean) => void;
    isNotesMode: boolean;
}

export function SudokuBoard({
    board, initialBoard, notes, activeCell, onCellClick
}: SudokuBoardProps) {

    // Keyboard support handled by parent or hook usually, but we can display visual helper

    return (
        <div className="flex justify-center p-2 select-none">
            <div className="grid grid-cols-9 gap-0.5 bg-gray-800 border-2 border-gray-800 rounded-lg overflow-hidden touch-manipulation">
                {board.map((row, r) => (
                    row.map((val, c) => {
                        const isInitial = initialBoard[r][c] !== 0;
                        const isActive = activeCell && activeCell[0] === r && activeCell[1] === c;



                        return (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => onCellClick(r, c)}
                                className={cn(
                                    "w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-white text-xl sm:text-2xl cursor-pointer relative",
                                    isActive && "bg-brand-primary/20",
                                    isInitial ? "font-bold text-black" : "text-brand-primary",
                                    (r === 2 || r === 5) && "mb-0.5", // Manual Gap hack or use nice CSS grid lines. 
                                    // Actually grid gap handles lines.
                                )}
                                style={{
                                    // Custom border logic if using gap for borders
                                    marginBottom: (r === 2 || r === 5) ? '2px' : '0',
                                    marginRight: (c === 2 || c === 5) ? '2px' : '0'
                                }}
                            >
                                {val !== 0 ? (
                                    val
                                ) : (
                                    // Render Notes
                                    <div className="grid grid-cols-3 w-full h-full p-0.5 pointer-events-none">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                            <div key={n} className="flex items-center justify-center text-[8px] leading-none text-gray-500 font-medium">
                                                {notes[r][c].includes(n) ? n : ''}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
}
