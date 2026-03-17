import React, { useEffect, useRef, useState } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    bottomContent: React.ReactNode;
}

export function MainLayout({ children, bottomContent }: MainLayoutProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [videoHasEnded, setVideoHasEnded] = useState(false);

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
        <div className="flex flex-col h-[100dvh] overflow-hidden relative selection:bg-arcade-cyan/30 text-white">
            {/* Native Video Background */}
            <video
                className="absolute top-0 left-0 w-full h-full object-cover z-[-2]"
                autoPlay
                muted
                playsInline
                onEnded={() => setVideoHasEnded(true)}
                poster="/silly_background.jpg"
            >
                <source src="/sillysurprise.mp4" type="video/mp4" />
            </video>

            {/* Overlay to ensure text readability */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-[-1] pointer-events-none transition-opacity duration-1000"></div>

            {/* Custom Floating Text Box on Top - Only shows after video ends */}
            <div 
                className={`absolute top-[10%] sm:top-[12%] left-1/2 transform -translate-x-1/2 z-0 bg-arcade-midnight/70 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center shadow-[0_0_30px_rgba(6,182,212,0.3)] max-w-md w-11/12 pointer-events-none transition-all duration-1000 ${
                    videoHasEnded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
                <h1 className="font-display text-4xl sm:text-5xl font-bold bg-gradient-to-r from-arcade-cyan to-arcade-magenta bg-clip-text text-transparent mb-2">Uncle Silly's</h1>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-arcade-gold mb-2">Arcade</h2>
                <p className="text-arcade-text-main text-sm sm:text-base font-medium">Let the silliness begin!</p>
            </div>

            {/* Content Foreground */}
            <div className={`relative z-10 flex flex-col h-full w-full pointer-events-auto transition-opacity duration-1000 ${videoHasEnded ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Scrollable Content Area */}
                <main
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto w-full px-4 scroll-smooth"
                >
                    {/* Added pt-40 to push content below the floating header area */}
                    <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full pb-32 pt-48 xl:pt-56">
                        {/* subtle glass backing for chat area on desktop */}
                        <div className="md:bg-arcade-paper/60 md:backdrop-blur-xl md:rounded-3xl md:p-6 md:border md:border-white/10 transition-all duration-300 shadow-2xl relative z-10">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Fixed Bottom Input Area */}
                <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
                    <div className="max-w-3xl mx-auto px-4 pb-4 pointer-events-auto relative z-30">
                        {bottomContent}
                    </div>
                </div>
            </div>
        </div>
    );
}
