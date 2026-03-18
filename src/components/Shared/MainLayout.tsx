import React, { useEffect, useRef, useState, useCallback } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    bottomContent: React.ReactNode;
}

/** Synthesise a short "celebration explosion" using Web Audio API — no files needed */
function playCelebrationSound() {
    try {
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.value = 1.0;
        master.connect(ctx.destination);

        // ── SUB-BASS THUD: sine sweep 80Hz→20Hz (the "boom") ────────────────
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(80, now);
        bass.frequency.exponentialRampToValueAtTime(20, now + 0.4);
        bassGain.gain.setValueAtTime(3.5, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        bass.connect(bassGain);
        bassGain.connect(master);
        bass.start(now);
        bass.stop(now + 0.55);

        // ── MID-BODY: noise through bandpass ~180Hz (adds the "thwump") ──────
        const bufLen = Math.floor(ctx.sampleRate * 0.4);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const band = ctx.createBiquadFilter();
        band.type = 'bandpass';
        band.frequency.value = 180;
        band.Q.value = 1.2;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(4.0, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        noise.connect(band);
        band.connect(noiseGain);
        noiseGain.connect(master);
        noise.start(now);
        noise.stop(now + 0.4);

        // ── SPARKLE: 3 fast rising celebratory pings ────────────────────────
        [0.08, 0.2, 0.34].forEach((delay, i) => {
            const osc = ctx.createOscillator();
            const g   = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500 + i * 250, now + delay);
            osc.frequency.exponentialRampToValueAtTime(1200 + i * 400, now + delay + 0.2);
            g.gain.setValueAtTime(0.25, now + delay);
            g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
            osc.connect(g);
            g.connect(master);
            osc.start(now + delay);
            osc.stop(now + delay + 0.3);
        });

        ctx.resume();
    } catch (_) { /* silent fail */ }
}


// ── Adjust this to match the moment the chest opens in the video (seconds) ──
const CHEST_OPEN_TIME = 3.5;

export function MainLayout({ children, bottomContent }: MainLayoutProps) {
    const scrollRef       = useRef<HTMLDivElement>(null);
    const [videoHasEnded, setVideoHasEnded] = useState(false);
    const soundPlayedRef  = useRef(false);
    const videoRef        = useRef<HTMLVideoElement>(null);

    const tryPlaySound = useCallback(() => {
        if (soundPlayedRef.current) return;
        soundPlayedRef.current = true;
        playCelebrationSound();
    }, []);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [children]);

    // Fire sound at CHEST_OPEN_TIME via timeupdate; fall back to first click if suspended
    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video || soundPlayedRef.current) return;
        if (video.currentTime >= CHEST_OPEN_TIME) {
            // Try immediate play
            try {
                const probe = new AudioContext();
                const canPlay = probe.state === 'running';
                probe.close();
                if (canPlay) {
                    tryPlaySound();
                } else {
                    // Suspended — unlock on first interaction
                    const unlock = () => { tryPlaySound(); };
                    document.addEventListener('click',      unlock, { once: true });
                    document.addEventListener('touchstart', unlock, { once: true });
                    soundPlayedRef.current = true; // prevent re-registering
                }
            } catch (_) {
                const unlock = () => tryPlaySound();
                document.addEventListener('click', unlock, { once: true });
                soundPlayedRef.current = true;
            }
        }
    }, [tryPlaySound]);

    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden relative selection:bg-arcade-cyan/30 text-white">
            {/* Native Video Background */}
            <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover z-[-2]"
                autoPlay
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
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
