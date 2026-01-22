'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';

interface TripleTapDetectorProps {
    children: ReactNode;
    redirectPath?: string;
}

export function TripleTapDetector({ children, redirectPath = '/admin' }: TripleTapDetectorProps) {
    const router = useRouter();
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);

    const handleTap = () => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime;

        // Reset if more than 600ms between taps
        if (timeSinceLastTap > 600) {
            setTapCount(1);
        } else {
            const newCount = tapCount + 1;
            setTapCount(newCount);

            // On third tap, redirect to admin
            if (newCount === 3) {
                // Get current locale from pathname
                const currentPath = window.location.pathname;
                const locale = currentPath.split('/')[1]; // 'es' or 'en'
                const adminUrl = `/${locale}${redirectPath}`;

                router.push(adminUrl);
                setTapCount(0); // Reset after redirect
            }
        }

        setLastTapTime(now);
    };

    // Auto-reset after 600ms of inactivity
    useEffect(() => {
        if (tapCount > 0) {
            const timeout = setTimeout(() => {
                setTapCount(0);
            }, 600);
            return () => clearTimeout(timeout);
        }
    }, [tapCount, lastTapTime]);

    return (
        <div onClick={handleTap} className="cursor-pointer">
            {children}
        </div>
    );
}
