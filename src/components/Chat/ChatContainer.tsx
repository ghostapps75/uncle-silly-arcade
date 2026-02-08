import { useRef, useEffect, useMemo } from 'react';
import { ChatBubble } from './ChatBubble';
import { InputBar } from './InputBar';
import type { ChatMessage, GameState } from '../../state/types';
import { STATE_CONFIG } from '../../state/machine';

interface ChatContainerProps {
    history: ChatMessage[];
    onInput: (text: string) => void;
    currentState: GameState;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ history, onInput, currentState }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const quickReplies = useMemo(() => {
        return STATE_CONFIG[currentState]?.replies || [];
    }, [currentState]);

    return (
        <div className="flex flex-col flex-1 h-full w-full max-w-2xl mx-auto overflow-hidden">
            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 px-2 py-4 scrollbar-thin scrollbar-thumb-arcade-cyan/20 scrollbar-track-transparent">
                {history.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                {/* Invisible element to scroll to */}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="mt-4 flex-none z-10">
                <InputBar
                    onSend={onInput}
                    currentState={currentState}
                    quickReplies={quickReplies}
                    isProcessing={false}
                />
            </div>
        </div>
    );
};
