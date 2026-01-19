"use client"

import React, { useState, useEffect } from 'react'
import LanguageSelector from '../shared/LanguageSelector'

export default function Footer() {
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-20" />; // Placeholder to avoid CLS
    }

    return (
        <footer className="w-full py-8 md:pb-8 pb-[130px] flex items-center justify-between px-6 bg-[var(--footer-bg)] text-xs text-slate-400 border-t border-[var(--footer-border)] mt-auto transition-colors duration-300">
            {/* Left: Branding/Empty for balance */}
            <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tighter text-slate-300">D&M</span>
            </div>

            {/* Center: Copyright */}
            <span className="font-medium tracking-widest opacity-70">
                MMXXVI © Digvijay & Maria
            </span>

            {/* Right: Language Selector */}
            {<LanguageSelector />}
        </footer>
    );
}
