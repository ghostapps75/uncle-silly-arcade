import { cn } from '../../lib/utils';
import { Undo, Eraser, PenLine } from 'lucide-react';

interface SudokuControlsProps {
    onNumber: (num: number) => void;
    onUndo: () => void;
    onErase: () => void;
    onToggleNotes: () => void;
    isNotesMode: boolean;
    canUndo: boolean;
}

export function SudokuControls({
    onNumber, onUndo, onErase, onToggleNotes, isNotesMode, canUndo
}: SudokuControlsProps) {

    return (
        <div className="flex flex-col gap-4 w-full max-w-xl xl:max-w-2xl mx-auto mt-4 px-2 sm:px-4">
            {/* Tools Row */}
            <div className="flex justify-around items-center gap-2 sm:gap-4 bg-[#fdfbf7] p-2 sm:p-3 rounded-lg shadow-md border-2 border-slate-200 font-serif">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-slate-800 disabled:opacity-30 active:scale-95 transition"
                >
                    <Undo size={20} />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">Undo</span>
                </button>

                <button
                    onClick={onToggleNotes}
                    className={cn(
                        "flex flex-col items-center gap-1 px-4 sm:px-6 py-2 rounded transition-all duration-200 active:scale-95 border-2",
                        isNotesMode
                            ? "bg-slate-800 text-white border-slate-800 shadow-inner"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    )}
                >
                    <PenLine size={20} />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                        Notes {isNotesMode ? 'ON' : 'OFF'}
                    </span>
                </button>

                <button
                    onClick={onErase}
                    className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-red-700 active:scale-95 transition"
                >
                    <Eraser size={20} />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">Erase</span>
                </button>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => onNumber(num)}
                        className="aspect-[4/3] sm:aspect-square flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-[var(--font-handwriting)] font-bold text-slate-800 bg-white border-2 border-slate-300 rounded shadow-sm hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 active:bg-blue-100 active:scale-95 transition-all"
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
}
