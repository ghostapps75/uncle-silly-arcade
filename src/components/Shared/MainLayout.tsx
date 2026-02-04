import React, { useEffect, useRef } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
    children: React.ReactNode;
    bottomContent: React.ReactNode;
}

export function MainLayout({ children, bottomContent }: MainLayoutProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [children]);

    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden relative selection:bg-arcade-cyan/30">
            {/* 
               Marquee Header 
               - Part of flex layout (flex-none)
               - Stays at top, never overlaps content physically
            */}
            <Header />

            {/* Scrollable Content Area */}
            <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto w-full px-4 scroll-smooth"
            >
                {/* 
                   Content Container 
                   - On desktop: bounded width with glass effect
                   - On mobile: full width, clean look
                */}
                <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full pb-32 pt-6">
                    {/* subtle glass backing for chat area on desktop */}
                    <div className="md:bg-arcade-paper/20 md:backdrop-blur-sm md:rounded-3xl md:p-6 md:border md:border-white/5 transition-all duration-300">
                        {children}
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Input Area */}
            <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
                <div className="max-w-3xl mx-auto px-4 pb-4 pointer-events-auto">
                    {bottomContent}
                </div>
            </div>
        </div>
    );
}
