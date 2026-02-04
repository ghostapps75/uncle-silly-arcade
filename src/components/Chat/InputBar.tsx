import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { GameState, QuickReply } from '../../state/types';

interface InputBarProps {
    onSend: (text: string) => void;
    currentState: GameState;
    quickReplies: QuickReply[];
    isProcessing: boolean;
}

export function InputBar({ onSend, currentState, quickReplies, isProcessing }: InputBarProps) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isProcessing) return;

        // We send input even if technically invalid, to let the bot respond with "I didn't catch that"
        // OR we could shake the input.
        // Logic decided: send it. UseGameState handles rejection message.
        onSend(input);
        setInput('');
    };

    const handleChip = (value: string) => {
        onSend(value);
    };

    // Focus input on mount/state change? Maybe not on mobile to prevent keyboard popup
    // useEffect(() => {
    //   if (!isTouchDevice()) inputRef.current?.focus(); 
    // }, [currentState]);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2 pb-safe-area z-50">
            {/* Quick Replies */}
            {quickReplies.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto px-2 pb-1 scrollbar-hide snap-x">
                    {quickReplies.map((reply) => (
                        <button
                            key={reply.value}
                            onClick={() => handleChip(reply.value)}
                            disabled={isProcessing}
                            className={cn(
                                "snap-start shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-transform active:scale-95 disabled:opacity-50",
                                reply.color === 'brand-primary' && "bg-brand-primary text-white shadow-md shadow-indigo-200",
                                reply.color === 'brand-secondary' && "bg-brand-secondary text-white shadow-md shadow-pink-200",
                                (reply.color === 'gray' || !reply.color) && "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            {reply.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Field */}
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto px-2 mb-2">
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isProcessing}
                        placeholder={currentState === 'HOME_MENU' ? "Type 'Trivia' or select a button..." : "Type your answer..."}
                        className="w-full pl-4 pr-10 py-3 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-brand-primary/50 text-lg transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="bg-brand-primary text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-90 shadow-md"
                >
                    <Send size={24} />
                </button>
            </form>
        </div>
    );
}
