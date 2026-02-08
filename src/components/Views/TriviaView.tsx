import React from 'react';
import type { TriviaState } from '../../state/types';

interface TriviaViewProps {
    data: TriviaState;
    onAnswer: (idx: number) => void;
    onNext: () => void;
}

export const TriviaView: React.FC<TriviaViewProps> = ({ data, onAnswer, onNext }) => {
    const { currentQuestion } = data;
    // Determine if question has been answered (we don't strictly track "answered" boolean in state, 
    // but usually logic would separate QUESTION vs FEEDBACK state. 
    // However, the user's prompt implies TRIVIA_QUESTION handles both or transitions?
    // In App.tsx: currentView === 'TRIVIA_QUESTION'. 
    // If the user answers, do we stay in TRIVIA_QUESTION?
    // The reducer in Step 498 has CHECK_ANSWER which updates score/streak/reward but doesn't explicitly change state away from TRIVIA_QUESTION?
    // Wait, step 498 reducer's CHECK_ANSWER does NOT transition. So we are still in TRIVIA_QUESTION.
    // We need local state or derived state to show the "Result" vs "Question".
    // Actually, if `streak` changed or score changed, we know... but simpler: 
    // The user said: "Feedback area (if answered)."
    // I might need a local state here 'selectedAnswer' to separate the view of "Picking" vs "Result".

    // BUT, the reducer updates REWARD.

    // Let's assume for now we show the buttons. If the user clicks one, we fire onAnswer.
    // If we want to disable buttons after answering, we'd need to know.
    // Let's implement basic layout first.

    if (!currentQuestion) return <div className="text-center text-white">Loading Question...</div>;

    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl mx-auto animate-fade-in">
            {/* Question Card */}
            <div className="bg-black/60 backdrop-blur-md border border-arcade-cyan/30 p-8 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] w-full mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-relaxed drop-shadow-md">
                    {currentQuestion.question}
                </h2>
            </div>

            {/* Answer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {currentQuestion.choices.map((choice, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAnswer(idx)}
                        className="group relative overflow-hidden bg-gray-900/80 border-2 border-gray-700 hover:border-arcade-magenta hover:shadow-[0_0_15px_#d946ef] text-left p-6 rounded-xl transition-all duration-200 active:scale-95"
                    >
                        <span className="text-gray-500 font-mono text-sm mr-3 group-hover:text-white transition-colors">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-lg md:text-xl font-bold text-gray-200 group-hover:text-white group-hover:translate-x-1 transition-transform inline-block">
                            {choice}
                        </span>
                    </button>
                ))}
            </div>

            {/* Next Button - Always visible for flow, or maybe only after interaction? 
                User said: "Ensure clicking [Next Question] uses the currently selected difficulty..."
                "Update the UI so that once in TRIVIA_QUESTION state, the only active buttons are [A] [B] [C] [D] and [Next Question]."
             */}
            <button
                onClick={onNext}
                className="mt-8 px-8 py-3 bg-arcade-cyan/10 border border-arcade-cyan text-arcade-cyan font-mono font-bold tracking-widest hover:bg-arcade-cyan hover:text-black transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_#06b6d4] rounded-full"
            >
                NEXT QUESTION ⏭
            </button>
        </div>
    );
};
