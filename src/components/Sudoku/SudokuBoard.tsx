
import { cn } from '../../lib/utils';

interface SudokuBoardProps {
    board: number[][];
    initialBoard: number[][];
    notes: number[][][];
    activeCell: [number, number] | null;
    onCellClick: (row: number, col: number) => void;
    onValueInput: (value: number, isNote: boolean) => void;
    isNotesMode: boolean;
}

export function SudokuBoard({
    board, initialBoard, notes, activeCell, onCellClick
}: SudokuBoardProps) {

    return (
        <div className="flex justify-center p-2 select-none">
            {/* The Board Container - Neon Glow Border */}
            <div className="relative p-1 rounded-xl bg-gradient-to-br from-arcade-cyan/30 to-arcade-magenta/30 shadow-[0_0_20px_rgba(26,26,46,0.5)]">
                <div className="grid grid-cols-9 gap-[1px] bg-arcade-cyan/40 border-2 border-arcade-cyan/40 rounded-lg overflow-hidden touch-manipulation shadow-inner">
                    {board.map((row, r) => (
                        row.map((val, c) => {
                            const isInitial = initialBoard[r][c] !== 0;
                            const isActive = activeCell && activeCell[0] === r && activeCell[1] === c;

                            // Calculate 3x3 block borders
                            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? '2px' : '0px';
                            const borderRight = (c + 1) % 3 === 0 && c !== 8 ? '2px' : '0px';

                            return (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => onCellClick(r, c)}
                                    className={cn(
                                        "w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-xl sm:text-2xl cursor-pointer relative transition-colors duration-100",
                                        "bg-arcade-midnight hover:bg-arcade-paper/80", // Default cell bg
                                        isActive && "bg-arcade-paper ring-2 ring-arcade-magenta ring-inset z-10",
                                        isInitial ? "font-display font-bold text-arcade-cyan" : "font-sans font-medium text-white",
                                    )}
                                    style={{
                                        marginBottom: borderBottom,
                                        marginRight: borderRight,
                                        // Use box-shadow to simulate thicker grid lines for 3x3 blocks without breaking layout
                                        boxShadow: (borderBottom !== '0px' || borderRight !== '0px') ? '0 0 0 0 transparent' : undefined
                                    }}
                                >
                                    {val !== 0 ? (
                                        <span className={cn(isActive && !isInitial && "animate-bounce-short")}>
                                            {val}
                                        </span>
                                    ) : (
                                        // Render Notes
                                        <div className="grid grid-cols-3 w-full h-full p-0.5 pointer-events-none">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                <div key={n} className="flex items-center justify-center text-[8px] leading-none text-arcade-text-muted/60 font-medium">
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
        </div>
    );
}
