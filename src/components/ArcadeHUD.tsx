import React from 'react';
import { useGameState } from '../hooks/useGameState';

export const ArcadeHUD: React.FC = () => {
    const { state, dispatch } = useGameState();

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'UPDATE_DIFFICULTY', payload: parseInt(e.target.value) });
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-black/80 border-b-4 border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.5)] p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between font-mono">

                {/* Score Section */}
                <div className="flex flex-col items-start">
                    <span className="text-cyan-400 text-xs uppercase tracking-widest">Score</span>
                    <span className="text-white text-3xl font-bold drop-shadow-[0_0_5px_#fff]">
                        {state.score.toString().padStart(6, '0')}
                    </span>
                </div>

                {/* Difficulty Slider Section */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-magenta-400 text-xs uppercase tracking-widest">Difficulty Level</span>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={state.difficulty}
                        onChange={handleDifficultyChange}
                        className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-magenta-500"
                    />
                    <div className="flex justify-between w-48 text-[10px] text-gray-400 px-1">
                        <span>Casey</span>
                        <span>Arrow</span>
                    </div>
                    <span className="text-magenta-500 font-bold text-xl">
                        LVL {state.difficulty}
                    </span>
                </div>

                {/* Streak Section */}
                <div className="flex flex-col items-end">
                    <span className="text-yellow-400 text-xs uppercase tracking-widest">Streak</span>
                    <div className="flex items-center gap-2">
                        <span className="text-white text-3xl font-bold italic animate-pulse">
                            {state.streak}
                        </span>
                        <span className="text-gray-500 text-xs">Best: {state.highStreak}</span>
                    </div>
                </div>

            </div>
        </header>
    );
};