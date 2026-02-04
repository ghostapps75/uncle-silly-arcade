
import { cn } from '../../lib/utils';
import type { ChatMessage } from '../../state/types';

interface ChatBubbleProps {
    message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isBot = message.role === 'bot';

    return (
        <div className={cn(
            "flex w-full mb-6 animate-slide-up group",
            isBot ? "justify-start" : "justify-end"
        )}>
            {/* Bot Avatar (Simple Circle) */}
            {isBot && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arcade-cyan via-arcade-magenta to-purple-600 shrink-0 mr-3 mt-1 shadow-[0_0_10px_rgba(217,70,239,0.3)] flex items-center justify-center text-xs font-bold text-white font-display select-none">
                    US
                </div>
            )}

            <div className={cn(
                "relative max-w-[85%] px-6 py-4 text-lg shadow-sm leading-relaxed transition-all duration-300 hover:scale-[1.01]",
                isBot
                    ? "bg-arcade-paper text-arcade-text-main rounded-2xl rounded-tl-sm border border-arcade-magenta/20 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.3)]"
                    : "bg-gradient-to-br from-arcade-cyan to-blue-500 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_15px_-3px_rgba(6,182,212,0.3)] font-medium"
            )}>
                {/* Glow effect for Bot bubbles */}
                {isBot && (
                    <div className="absolute inset-0 rounded-2xl rounded-tl-sm bg-arcade-magenta/5 pointer-events-none" />
                )}

                <div className="whitespace-pre-wrap relative z-10 font-sans tracking-wide">
                    {message.content}
                </div>

                <div className={cn(
                    "text-[10px] mt-2 opacity-60 font-medium tracking-wider relative z-10",
                    isBot ? "text-left text-arcade-text-muted" : "text-right text-white/80"
                )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}
