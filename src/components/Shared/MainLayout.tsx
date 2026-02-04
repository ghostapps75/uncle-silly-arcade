import React, { useEffect, useRef } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    bottomContent: React.ReactNode;
}

export function MainLayout({ children, bottomContent }: MainLayoutProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            // Smooth scroll
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [children]);

    return (
        <div className="flex flex-col h-screen bg-brand-bg overflow-hidden">
            {/* Header (optional, maybe just Uncle Silly title?) */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-center shrink-0 z-10 sticky top-0">
                <h1 className="font-display font-bold text-xl text-brand-primary tracking-wide">
                    Uncle Silly
                </h1>
            </header>

            {/* Scrollable Content Area */}
            <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth pb-32" // Padding bottom for input bar
            >
                <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">
                    {children}
                </div>
            </main>

            {/* Fixed Bottom Input */}
            {bottomContent}
        </div>
    );
}
