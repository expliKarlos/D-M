'use client';

import { useTheme } from 'next-themes';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { useEffect, useState } from 'react';

export default function Footer() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-20" />; // Placeholder to avoid CLS
    }

    return (
        <footer className="w-full py-8 md:pb-8 pb-[130px] flex items-center justify-between px-6 bg-slate-50 dark:bg-black/20 text-xs text-slate-400 border-t border-slate-100 dark:border-white/5 mt-auto">
            {/* Left: Theme Toggler */}
            <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle Dark Mode"
            >
                {resolvedTheme === 'dark' ? (
                    <span className="material-icons-outlined text-lg">light_mode</span>
                ) : (
                    <span className="material-icons-outlined text-lg">dark_mode</span>
                )}
            </button>

            {/* Center: Copyright */}
            <span className="font-medium tracking-widest opacity-70">
                MMXXVI © Digvijay & Maria
            </span>

            {/* Right: Language Selector */}
            {<LanguageSelector />}
        </footer>
    );
}
