import { format, addDays, subDays, isAfter, startOfDay } from 'date-fns';
import type { AppContext, Action } from '../../state/types';
import { formatCDD } from '../../lib/formatters';

interface CddArchiveViewProps {
    state: AppContext;
    dispatch: React.Dispatch<Action>;
}

export function CddArchiveView({ state, dispatch }: CddArchiveViewProps) {
    const today = startOfDay(new Date());
    // Default to today string if undefined
    const viewingDateStr = state.viewingDate || format(today, 'yyyy-MM-dd');
    const viewingDate = new Date(viewingDateStr + 'T12:00:00'); // Safe parsing to avoid timezone shift

    const data = state.cddCache[viewingDateStr];
    const isLoading = state.isProcessing; // Global processing flag might be used, or we check if data is missing

    const handlePrev = () => {
        const prev = subDays(viewingDate, 1);
        const dateStr = format(prev, 'yyyy-MM-dd');
        dispatch({ type: 'SET_VIEWING_DATE', payload: dateStr });
        // Trigger fetch (the Transition logic in useGameState usually triggers fetch, 
        // but since we are ALREADY in CDD_VIEW, we need to trigger the action manually?
        // Actually useGameState only triggers fetch on TRANSITION.
        // We might need a specific FETCH action that doesn't require transition.
        // But we re-used FETCH_CDD in the reducer? No, FETCH_CDD is a side effect key in `calculateNextState`.
        // We need to modify `useGameState` to watch `viewingDate` or allow manual fetch dispatch?
        // For now, let's just dispatch a custom side effect or utilize the fact that we can call the API directly? 
        // No, we want to go through the system.
        // Let's modify logic.ts to allow a 'FETCH' input?
        // Or better: dispatch a TRANSITION to CDD_VIEW again?
        dispatch({ type: 'TRANSITION', payload: 'CDD_VIEW' }); // Re-trigger?
        // Wait, standard reducer doesn't re-run the side-effect merely on state change unless `calculateNextState` returns it.
        // Let's add a specific Effect hook in CddArchiveView or useGameState to fetch when viewingDate changes.
    };

    // Quick fix: Use Effect here to trigger fetch if data missing
    // But we need to call the internal fetch logic.
    // Let's rely on the user input "FETCH_CDD" to string?
    // Actually, `useGameState` exposes `handleInput`.
    // If we send "FETCH_CDD" as input?

    // Better: We implemented `FETCH_CDD` handling in `useGameState`'s `useEffect` (or generic async handler).
    // The async handler runs when `action` is set by `calculateNextState`.
    // So if we input "FETCH_CDD", `logic.ts` might not understand it.

    // Let's just Dispatch a generic "LOAD_CDD" action? No, that puts data IN.

    // I will modify `useGameState` to watch `state.viewingDate` and auto-fetch if missing.

    const handleNext = () => {
        const next = addDays(viewingDate, 1);
        if (isAfter(next, today)) return; // Can't go to future
        const dateStr = format(next, 'yyyy-MM-dd');
        dispatch({ type: 'SET_VIEWING_DATE', payload: dateStr });
    };

    const isToday = viewingDateStr === format(today, 'yyyy-MM-dd');

    // Content Rendering
    // We reuse formatCDD but we need to render it nicely.
    // Since formatCDD returns Markdown, we might want to just render it inside a bubble-like container
    // or parse it. For now, let's use whitespace-pre-wrap style similar to chat.

    return (
        <div className="flex flex-col h-full w-full bg-arcade-midnight text-arcade-text-main overflow-hidden relative">
            {/* Header / Nav */}
            <div className="flex items-center justify-between p-4 bg-arcade-paper border-b border-arcade-magenta/20 shadow-md z-10">
                <button
                    onClick={handlePrev}
                    disabled={isLoading}
                    className={`p-2 rounded-lg transition-colors ${isLoading ? 'text-gray-600 cursor-not-allowed' : 'bg-arcade-midnight text-arcade-cyan hover:bg-arcade-cyan/10'}`}
                >
                    &larr; Prev
                </button>

                <div className="text-center">
                    <h2 className="text-xl font-display font-bold text-arcade-magenta">Daily Debrief</h2>
                    <div className="text-sm text-arcade-text-muted">{viewingDateStr}</div>
                </div>

                <button
                    onClick={handleNext}
                    disabled={isToday || isLoading}
                    className={`p-2 rounded-lg transition-colors ${isToday || isLoading ? 'text-gray-600 cursor-not-allowed' : 'bg-arcade-midnight text-arcade-cyan hover:bg-arcade-cyan/10'}`}
                >
                    Next &rarr;
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto bg-arcade-paper p-6 md:p-10 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)] border border-arcade-cyan/10">
                    {!data ? (
                        isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <span className="loading-spinner mb-4" />
                                <p>Searching the archives...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-arcade-text-muted">
                                <p className="mb-4">Could not retrieve the Daily Debrief for this date.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-arcade-magenta/20 text-arcade-magenta rounded hover:bg-arcade-magenta/30 transition-colors"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="prose prose-invert prose-headings:font-display prose-headings:text-arcade-magenta prose-p:text-arcade-text-main prose-strong:text-arcade-cyan max-w-none">
                            {/* We need a Markdown renderer or just whitespace-pre-wrap if formatCDD returns md-like text */}
                            <div className="whitespace-pre-wrap font-sans leading-relaxed text-lg">
                                {formatCDD(data)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
