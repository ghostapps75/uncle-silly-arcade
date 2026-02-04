
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
        <div className="flex flex-col gap-5 w-full max-w-sm mx-auto mt-6 px-4">
            {/* Tools Row */}
            <div className="flex justify-between items-center gap-4 bg-arcade-paper/40 p-2 rounded-2xl backdrop-blur-sm border border-white/5">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="flex flex-col items-center gap-1 p-2 text-arcade-text-muted hover:text-white disabled:opacity-30 active:scale-95 transition"
                >
                    <Undo size={22} />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Undo</span>
                </button>

                <button
                    onClick={onToggleNotes}
                    className={cn(
                        "flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-300 active:scale-95 border",
                        isNotesMode
                            ? "bg-arcade-cyan text-arcade-midnight border-arcade-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                            : "bg-white/5 text-arcade-text-muted border-white/5 hover:bg-white/10"
                    )}
                >
                    <PenLine size={22} />
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                        Notes {isNotesMode ? 'ON' : 'OFF'}
                    </span>
                </button>

                <button
                    onClick={onErase}
                    className="flex flex-col items-center gap-1 p-2 text-arcade-text-muted hover:text-arcade-magenta active:scale-95 transition"
                >
                    <Eraser size={22} />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Erase</span>
                </button>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-9 gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => onNumber(num)}
                        className="aspect-[4/5] sm:aspect-square flex items-center justify-center text-xl sm:text-2xl font-display font-bold text-arcade-cyan bg-arcade-paper border border-white/5 rounded-xl shadow-lg active:bg-arcade-cyan active:text-arcade-midnight hover:border-arcade-cyan/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
}
