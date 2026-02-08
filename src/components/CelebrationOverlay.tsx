import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationOverlayProps {
    streak: number;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ streak }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Fire Confetti!
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#06b6d4', '#d946ef', '#facc15'] // Cyan, Magenta, Yellow
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#06b6d4', '#d946ef', '#facc15']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();

        // Cleanup
        const timer = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(timer);
    }, [streak]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center animate-bounce-in">
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] filter">
                    STREAK!
                </h1>
                <p className="text-white font-mono text-2xl mt-4 font-bold drop-shadow-md">
                    {streak} IN A ROW!
                </p>
            </div>
        </div>
    );
};
