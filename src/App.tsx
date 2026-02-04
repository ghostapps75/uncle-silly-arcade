
import { useMemo } from 'react';
import { useGameState } from './hooks/useGameState';
import { MainLayout } from './components/Shared/MainLayout';
import { ChatBubble } from './components/Chat/ChatBubble';
import { InputBar } from './components/Chat/InputBar';
import { STATE_CONFIG } from './state/machine';
import { SudokuBoard } from './components/Sudoku/SudokuBoard';
import { SudokuControls } from './components/Sudoku/SudokuControls';
import { useSudoku } from './hooks/useSudoku';

function App() {
  const { state, dispatch, handleInput } = useGameState();
  const sudoku = useSudoku({ state: state.sudoku, dispatch });

  // Get Quick Replies for current state
  const quickReplies = useMemo(() => {
    return STATE_CONFIG[state.state]?.replies || [];
  }, [state.state]);

  const isSudokuMode = state.state === 'SUDOKU_PLAY' || state.state === 'SUDOKU_MENU';

  return (
    <MainLayout
      bottomContent={
        <InputBar
          onSend={handleInput}
          currentState={state.state}
          quickReplies={quickReplies}
          isProcessing={state.isProcessing}
        />
      }
    >
      {/* Chat View */}
      {!isSudokuMode && (
        <>
          {state.chatHistory.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {state.isProcessing && (
            <div className="flex w-full mb-6 animate-fade-in justify-start">
              <div className="bg-arcade-paper px-6 py-4 rounded-2xl rounded-tl-sm border border-arcade-magenta/20 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.3)] relative">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl rounded-tl-sm bg-arcade-magenta/5 pointer-events-none" />

                <div className="flex gap-1.5 relative z-10">
                  <span className="w-2 h-2 bg-arcade-magenta rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-arcade-magenta rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-arcade-magenta rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sudoku Mode */}
      {/* Show Chat history even in Sudoku Menu? Maybe just last message? 
          For simplicity, SUDOKU_MENU shows chat. SUDOKU_PLAY shows Board.
      */}
      {state.state === 'SUDOKU_MENU' && (
        <>
          {state.chatHistory.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </>
      )}

      {state.state === 'SUDOKU_PLAY' && state.sudoku && (
        <div className="flex flex-col items-center justify-start flex-1 h-full pt-4">
          <h2 className="text-xl font-display font-medium text-brand-primary mb-2">Sudoku</h2>

          <SudokuBoard
            board={state.sudoku.board}
            initialBoard={state.sudoku.initialBoard}
            notes={state.sudoku.notes}
            activeCell={sudoku.activeCell}
            onCellClick={sudoku.handleCellClick}
            onValueInput={sudoku.handleNumberInput}
            isNotesMode={sudoku.isNotesMode}
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
