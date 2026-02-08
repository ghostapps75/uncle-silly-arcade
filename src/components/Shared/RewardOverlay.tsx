import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface RewardOverlayProps {
    onComplete: () => void;
}

export function RewardOverlay({ onComplete }: RewardOverlayProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Fire Confetti
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#06b6d4', '#d946ef', '#ffffff'] // Cyan, Magenta, White
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#06b6d4', '#d946ef', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();

        // Cleanup timer matches the App.tsx timeout, but we can do local cleanup too
        // Animation cleanup is handled by unmount usually
        return () => {
            confetti.reset();
        }
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

            <div className="relative z-10 animate-bounce-in">
                <h1 className="text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-arcade-cyan via-white to-arcade-magenta drop-shadow-[0_0_30px_rgba(217,70,239,0.8)] tracking-tighter transform -rotate-6">
                    STREAK!
                </h1>
                <div className="absolute -inset-4 bg-arcade-magenta/20 blur-3xl rounded-full -z-10 animate-pulse" />
            </div>
        </div>
    );
}
