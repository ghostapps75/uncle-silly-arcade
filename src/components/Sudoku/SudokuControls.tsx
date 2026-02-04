
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
        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto mt-4 px-2">
            {/* Tools Row */}
            <div className="flex justify-between items-center gap-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="flex flex-col items-center gap-1 p-2 text-gray-600 disabled:opacity-30 active:scale-95 transition"
                >
                    <Undo size={24} />
                    <span className="text-xs">Undo</span>
                </button>

                <button
                    onClick={onToggleNotes}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition active:scale-95",
                        isNotesMode ? "bg-brand-primary text-white" : "text-gray-600 bg-gray-100"
                    )}
                >
                    <PenLine size={24} />
                    <span className="text-xs">Notes {isNotesMode ? 'ON' : 'OFF'}</span>
                </button>

                <button
                    onClick={onErase}
                    className="flex flex-col items-center gap-1 p-2 text-gray-600 active:scale-95 transition"
                >
                    <Eraser size={24} />
                    <span className="text-xs">Erase</span>
                </button>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-9 gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => onNumber(num)}
                        className="aspect-[4/5] sm:aspect-square flex items-center justify-center text-xl sm:text-2xl font-medium text-brand-primary bg-white border border-gray-200 rounded-lg shadow-sm active:bg-brand-primary active:text-white transition-colors"
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
}
