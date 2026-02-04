
import { cn } from '../../lib/utils';
import type { ChatMessage } from '../../state/types';

interface ChatBubbleProps {
    message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isBot = message.role === 'bot';

    return (
        <div className={cn(
            "flex w-full mb-4 animate-slide-up",
            isBot ? "justify-start" : "justify-end"
        )}>
            <div className={cn(
                "max-w-[85%] px-5 py-3 rounded-2xl text-lg shadow-sm leading-relaxed",
                isBot
                    ? "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                    : "bg-brand-primary text-white rounded-br-sm"
            )}>
                {/* Render content safely. For now just text. Future: Markdown or HTML */}
                <div className="whitespace-pre-wrap">{message.content}</div>

                <div className={cn(
                    "text-[10px] mt-1 opacity-50",
                    isBot ? "text-left" : "text-right"
                )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}
