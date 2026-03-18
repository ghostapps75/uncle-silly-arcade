import React, { useState } from 'react';
import type { TriviaState } from '../../state/types';

interface TriviaViewProps {
    data: TriviaState;
    isFeedback: boolean;
    isProcessing: boolean;
    onAnswer: (idx: number) => void;
    onNext: () => void;
    onMenu: () => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

export const TriviaView: React.FC<TriviaViewProps> = ({
    data, isFeedback, isProcessing, onAnswer, onNext, onMenu
}) => {
    const { currentQuestion, lastResult, hasUsedHint, selectedDifficulty } = data;
    const [showHint, setShowHint] = useState(false);

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center flex-1">
                <div className="text-white/60 text-lg animate-pulse">Loading question…</div>
            </div>
        );
    }

    const diffLabel = selectedDifficulty === 'HARD' ? '🔴 Hard' : '🟢 Easy';

    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl mx-auto px-4 gap-4 animate-fade-in">

            {/* ── Question Card ── */}
            <div className="w-full bg-white/15 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                {/* Header strip */}
                <div className="flex justify-between items-center mb-4 text-xs font-mono text-white/50 uppercase tracking-widest">
                    <span>{diffLabel} · {data.currentCategory || 'TRIVIA'}</span>
                    {data.streak! > 1 && (
                        <span className="text-amber-400">🔥 {data.streak} streak</span>
                    )}
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white leading-snug text-center">
                    {currentQuestion.question}
                </h2>

                {/* Hint */}
                {!isFeedback && currentQuestion.hint && (
                    <div className="mt-4 text-center">
                        {showHint ? (
                            <p className="text-amber-300 text-sm italic opacity-90">💡 {currentQuestion.hint}</p>
                        ) : (
                            <button
                                onClick={() => setShowHint(true)}
                                className="text-white/40 text-xs hover:text-amber-300 transition-colors underline underline-offset-2"
                            >
                                Show hint
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Choices / Feedback ── */}
            {!isFeedback ? (
                /* ── Answering ── */
                <div className="grid grid-cols-2 gap-3 w-full">
                    {currentQuestion.choices.map((choice, idx) => (
                        <button
                            key={idx}
                            onClick={() => { if (!isProcessing) onAnswer(idx); }}
                            disabled={isProcessing}
                            className="group relative bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/25 hover:border-white/50 rounded-2xl p-4 text-left transition-all duration-150 active:scale-95 disabled:opacity-50"
                        >
                            <span className="block text-xs font-mono text-white/40 group-hover:text-white/70 mb-1 transition-colors">
                                {LABELS[idx]}
                            </span>
                            <span className="block text-base font-semibold text-white leading-snug">
                                {choice}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                /* ── Result feedback ── */
                <div className={`w-full rounded-3xl p-5 border backdrop-blur-sm ${
                    lastResult?.isCorrect
                        ? 'bg-emerald-500/20 border-emerald-400/40'
                        : 'bg-red-500/20 border-red-400/40'
                }`}>
                    <div className="text-2xl font-bold text-center mb-2">
                        {lastResult?.isCorrect ? '✅ Correct!' : '❌ Not quite!'}
                    </div>
                    {!lastResult?.isCorrect && (
                        <p className="text-center text-white/70 text-sm mb-2">
                            The answer was <strong className="text-white">{LABELS[lastResult?.correctIndex ?? 0]}. {currentQuestion.choices[lastResult?.correctIndex ?? 0]}</strong>
                        </p>
                    )}
                    {lastResult?.explanation && (
                        <p className="text-center text-white/80 text-sm italic leading-relaxed">
                            {lastResult.explanation}
                        </p>
                    )}
                </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex gap-3 w-full">
                {isFeedback && (
                    <button
                        onClick={onNext}
                        disabled={isProcessing}
                        className="flex-1 py-3 rounded-full bg-white/20 hover:bg-white/35 border border-white/30 text-white font-bold tracking-wide transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isProcessing ? '⏳ Loading…' : 'Next Question ⏭'}
                    </button>
                )}
                <button
                    onClick={onMenu}
                    className={`py-3 px-5 rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/40 text-sm transition-all ${isFeedback ? '' : 'ml-auto'}`}
                >
                    Menu
                </button>
            </div>
        </div>
    );
};
