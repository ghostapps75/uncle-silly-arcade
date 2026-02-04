import { useState, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
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
        onSend(input);
        setInput('');
    };

    const handleChip = (value: string) => {
        onSend(value);
    };

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Quick Replies (Floating Chips) */}
            {quickReplies.length > 0 && (
                <div className="flex gap-2 overflow-x-auto px-2 pb-2 scrollbar-hide snap-x mask-fade-sides">
                    {quickReplies.map((reply) => (
                        <button
                            key={reply.value}
                            onClick={() => handleChip(reply.value)}
                            disabled={isProcessing}
                            className={cn(
                                "snap-start shrink-0 px-5 py-2 rounded-full font-display font-bold text-sm transition-all active:scale-95 disabled:opacity-50 border-2 select-none",
                                // Primary Action (Cyan)
                                reply.color === 'brand-primary' && "bg-arcade-cyan text-arcade-midnight border-arcade-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-white hover:border-white hover:text-arcade-cyan",
                                // Secondary Action (Magenta)
                                reply.color === 'brand-secondary' && "bg-arcade-magenta text-white border-arcade-magenta shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:bg-white hover:border-white hover:text-arcade-magenta",
                                // Default / Neutral (Outline)
                                (reply.color === 'gray' || !reply.color) && "bg-arcade-paper/80 backdrop-blur-sm text-arcade-cyan border-arcade-cyan/30 hover:bg-arcade-cyan hover:text-arcade-midnight hover:border-arcade-cyan hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            )}
                        >
                            {reply.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Capsule */}
            <form onSubmit={handleSubmit} className="relative group">
                <div className={cn(
                    "absolute -inset-0.5 rounded-full bg-gradient-to-r from-arcade-cyan to-arcade-magenta opacity-30 blur group-focus-within:opacity-75 transition duration-500",
                    isProcessing && "opacity-0"
                )}></div>

                <div className="relative flex items-center bg-arcade-paper/90 backdrop-blur-xl rounded-full p-1 pr-2 border border-white/10 shadow-2xl">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isProcessing}
                        placeholder={currentState === 'HOME_MENU' ? "Say 'Hello' or pick an option..." : "Type your answer..."}
                        className="flex-1 bg-transparent border-none text-white placeholder:text-arcade-text-muted/50 px-5 py-3 text-lg focus:ring-0 font-sans tracking-wide"
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || isProcessing}
                        className={cn(
                            "p-3 rounded-full transition-all duration-300 transform active:scale-90 flex items-center justify-center",
                            !input.trim() || isProcessing
                                ? "opacity-50 cursor-not-allowed bg-white/5 text-white/30"
                                : "bg-gradient-to-tr from-arcade-cyan to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.7)]"
                        )}
                    >
                        {isProcessing ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
