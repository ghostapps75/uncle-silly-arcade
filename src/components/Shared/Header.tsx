export function Header() {
    return (
        <header className="relative w-full z-50 flex flex-col items-center justify-center bg-gradient-to-b from-arcade-paper via-arcade-midnight to-arcade-midnight border-b-4 border-arcade-cyan/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] shrink-0 pb-4 pt- safe-area-top">
            {/* 
               Marquee Container
               - Deep Arcade Gradient
               - Neon Bottom Border/Glow
               - Large responsive height
            */}

            <div className="w-full max-w-4xl mx-auto flex justify-center items-center px-4 py-2">
                {/* Logo Container with Ambient Glow */}
                <div className="relative group">
                    {/* Ambient Glow behind logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-arcade-cyan/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-arcade-cyan/30 transition-all duration-700"></div>

                    <img
                        src="/branding/uncle-silly-logo.png"
                        alt="Uncle Silly's Arcade"
                        className="relative z-10 w-64 md:w-[500px] h-auto object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-transform duration-500 hover:scale-[1.02]"
                    />
                </div>
            </div>
        </header>
    );
}
