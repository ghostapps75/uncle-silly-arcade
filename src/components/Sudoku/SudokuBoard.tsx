import { cn } from '../../lib/utils';

interface SudokuBoardProps {
    board: number[][];
    initialBoard: number[][];
    notes: number[][][];
    activeCell: [number, number] | null;
    onCellClick: (row: number, col: number) => void;
    onValueInput: (value: number, isNote: boolean) => void;
    isNotesMode: boolean;
    difficulty: string;
    puzzleId: string | number;
}

export function SudokuBoard({
    board, initialBoard, notes, activeCell, onCellClick, difficulty, puzzleId
}: SudokuBoardProps) {

    return (
        <div className="flex justify-center p-2 sm:p-4 select-none w-full max-w-2xl mx-auto my-4 xl:max-w-3xl">
            {/* The Realistic Scorecard Container */}
            <div className="w-full bg-[#fdfbf7] rounded-lg shadow-[15px_15px_40px_rgba(0,0,0,0.5)] overflow-hidden font-serif text-slate-800 border-4 border-slate-200">
                {/* Scorecard Header */}
                <div className="bg-slate-800 text-white p-3 sm:p-4 border-b-4 border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest">SUDOKU</h2>
                        <div className="bg-slate-700 px-2 py-1 sm:px-3 rounded text-xs sm:text-sm font-mono block uppercase">DIFFICULTY: {difficulty}</div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-semibold flex justify-between">
                        <span>Official Puzzle Archive</span>
                        <span>No. {puzzleId}</span>
                    </div>
                </div>

                {/* The Grid Area */}
                <div className="p-3 sm:p-6 md:p-8 bg-[#f0ece3] flex justify-center">
                    <div className="grid grid-cols-9 bg-slate-800 border-2 sm:border-4 border-slate-800 gap-[1px] shadow-sm w-full max-w-xl xl:max-w-2xl aspect-square">
                        {board.map((row, r) => (
                            row.map((val, c) => {
                                const isInitial = initialBoard[r][c] !== 0;
                                const isActive = activeCell && activeCell[0] === r && activeCell[1] === c;

                                // Thicker borders for 3x3
                                const mb = (r + 1) % 3 === 0 && r !== 8 ? '2px' : '0px';
                                const mr = (c + 1) % 3 === 0 && c !== 8 ? '2px' : '0px';

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => onCellClick(r, c)}
                                        className={cn(
                                            "w-full h-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl xl:text-5xl cursor-pointer relative",
                                            !isActive && "bg-white hover:bg-slate-50",
                                            isActive && "bg-blue-50 ring-2 ring-blue-500 ring-inset z-10",
                                            isInitial ? "font-serif font-bold text-slate-800" : "font-[var(--font-handwriting)] font-bold text-blue-700 tracking-tighter"
                                        )}
                                        style={{
                                            marginBottom: mb,
                                            marginRight: mr,
                                        }}
                                    >
                                        {val !== 0 ? (
                                            <span className={cn(isActive && !isInitial && "transform scale-110 transition-transform")}>
                                                {val}
                                            </span>
                                        ) : (
                                            // Render Notes
                                            <div className="grid grid-cols-3 w-full h-full p-0.5 pointer-events-none">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                    <div key={n} className="flex items-center justify-center text-[10px] sm:text-[14px] md:text-[18px] leading-none text-slate-500/80 font-[var(--font-handwriting)] font-medium">
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
        </div>
    );
}
