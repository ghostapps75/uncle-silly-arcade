import { useMemo, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { MainLayout } from './components/Shared/MainLayout';
import { InputBar } from './components/Chat/InputBar';
import { STATE_CONFIG } from './state/machine';
import { SudokuBoard } from './components/Sudoku/SudokuBoard';
import { SudokuControls } from './components/Sudoku/SudokuControls';
import { useSudoku } from './hooks/useSudoku';
import { CddArchiveView } from './components/Views/CddArchiveView';
import { TriviaView } from './components/Views/TriviaView';

/** States where a card view takes over and we DON'T show chat bubbles */
const CARD_STATES = ['TRIVIA_QUESTION', 'TRIVIA_FEEDBACK', 'SUDOKU_PLAY', 'CDD_VIEW'] as const;
/** States where we show only the LAST bot message (no history stack) */
const PANEL_STATES = [
    'HOME_MENU',
    'TRIVIA_DIFFICULTY_MENU',
    'TRIVIA_MENU',
    'SUDOKU_MENU',
] as const;

function App() {
    const { state, dispatch, handleInput } = useGameState();
    const sudoku = useSudoku({ state: state.sudoku, dispatch });

    const quickReplies = useMemo(
        () => STATE_CONFIG[state.state]?.replies || [],
        [state.state]
    );

    const isCardState  = (CARD_STATES  as readonly string[]).includes(state.state);
    const isPanelState = (PANEL_STATES as readonly string[]).includes(state.state);

    // For panel states: show only the last bot message as a floating card
    const lastBotMessage = useMemo(() => {
        for (let i = state.chatHistory.length - 1; i >= 0; i--) {
            if (state.chatHistory[i].role === 'bot') return state.chatHistory[i];
        }
        return null;
    }, [state.chatHistory]);

    const handleTriviaAnswer = useCallback((idx: number) => {
        const token = `ANSWER_${String.fromCharCode(65 + idx)}`;
        handleInput(token);
    }, [handleInput]);

    const handleTriviaNext = useCallback(() => handleInput('NEXT'),  [handleInput]);
    const handleTriviaMenu = useCallback(() => handleInput('MENU'),  [handleInput]);

    return (
        <MainLayout
            bottomContent={
                !isCardState && !isPanelState
                    ? <InputBar
                        onSend={handleInput}
                        currentState={state.state}
                        quickReplies={quickReplies}
                        isProcessing={state.isProcessing}
                      />
                    : null
            }
        >
            {/* ── Persistent "← Menu" escape button ── */}
            {state.state !== 'HOME_MENU' && (
                <div className="absolute top-4 left-4 z-50">
                    <button
                        onClick={() => handleInput('MENU')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-black/60 hover:border-white/40 text-sm font-medium transition-all active:scale-95"
                    >
                        ← Menu
                    </button>
                </div>
            )}

            {/* ── Panel states: single frosted card + buttons ── */}
            {isPanelState && lastBotMessage && (
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-xl mx-auto px-4 gap-6 animate-fade-in">
                    {/* Frosted prompt card */}
                    <div className="w-full bg-white/15 backdrop-blur-lg border border-white/30 rounded-3xl px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-center">
                        <p className="text-white text-xl md:text-2xl font-semibold leading-snug">
                            {lastBotMessage.content}
                        </p>
                    </div>

                    {/* Buttons grid */}
                    <div className={`
                        grid gap-3 w-full
                        ${quickReplies.length <= 2 ? 'grid-cols-1' : quickReplies.length === 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}
                    `}>
                        {quickReplies.map(reply => (
                            <button
                                key={reply.value}
                                onClick={() => handleInput(reply.value)}
                                disabled={state.isProcessing}
                                className={`
                                    py-4 px-5 rounded-2xl font-bold text-base transition-all duration-150 active:scale-95 disabled:opacity-50
                                    ${reply.color === 'brand-primary'
                                        ? 'bg-arcade-cyan/30 border-2 border-arcade-cyan text-white hover:bg-arcade-cyan hover:text-arcade-midnight'
                                        : reply.color === 'brand-secondary'
                                        ? 'bg-arcade-magenta/30 border-2 border-arcade-magenta text-white hover:bg-arcade-magenta'
                                        : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white'}
                                    backdrop-blur-sm shadow-md
                                `}
                            >
                                {reply.label}
                            </button>
                        ))}
                    </div>

                    {state.isProcessing && (
                        <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                        </div>
                    )}
                </div>
            )}

            {/* ── CDD View ── */}
            {state.state === 'CDD_VIEW' && (
                <CddArchiveView state={state} dispatch={dispatch} />
            )}

            {/* ── Trivia card view ── */}
            {(state.state === 'TRIVIA_QUESTION' || state.state === 'TRIVIA_FEEDBACK') && state.trivia && (
                <TriviaView
                    data={state.trivia}
                    isFeedback={state.state === 'TRIVIA_FEEDBACK'}
                    isProcessing={state.isProcessing}
                    onAnswer={handleTriviaAnswer}
                    onNext={handleTriviaNext}
                    onMenu={handleTriviaMenu}
                />
            )}

            {state.state === 'SUDOKU_PLAY' && state.sudoku && (
                <div className="flex flex-col items-center justify-start flex-1 h-full pt-4 md:pt-8 w-full">
                    <SudokuBoard
                        board={state.sudoku.board}
                        initialBoard={state.sudoku.initialBoard}
                        notes={state.sudoku.notes}
                        activeCell={sudoku.activeCell}
                        onCellClick={sudoku.handleCellClick}
                        onValueInput={sudoku.handleNumberInput}
                        isNotesMode={sudoku.isNotesMode}
                        difficulty={state.sudoku.difficulty}
                        puzzleId={Math.floor((state.sudoku.startTime || Date.now()) % 100000).toString().padStart(5, '0')}
                    />
                    <SudokuControls
                        onNumber={sudoku.handleNumberInput}
                        onUndo={sudoku.handleUndo}
                        onErase={sudoku.handleErase}
                        onToggleNotes={() => sudoku.setIsNotesMode(prev => !prev)}
                        isNotesMode={sudoku.isNotesMode}
                        canUndo={state.sudoku.history.length > 0}
                    />
                </div>
            )}

        </MainLayout>
    );
}

export default App;
