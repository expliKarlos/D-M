'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { updateTheme, updateFont } from '@/lib/actions/theme-actions';
import { supabase } from '@/lib/services/supabase';

type Theme = 'default' | 'romantic' | 'golden' | 'sage' | 'blue' | 'lavender';
type Font = 'modern' | 'classic' | 'royal';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => Promise<void>;
    font: Font;
    setFont: (font: Font) => Promise<void>;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    defaultTheme = 'default'
}: {
    children: React.ReactNode;
    defaultTheme?: string
}) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme as Theme);
    const [isLoading, setIsLoading] = useState(true);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'default') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', theme);
        }

        // Save to local storage for persistence across reloads
        localStorage.setItem('theme_preference', theme);
    }, [theme]);

    const [font, setFontState] = useState<Font>('modern');

    // Apply font to document
    useEffect(() => {
        const root = document.documentElement;

        if (font === 'modern') {
            root.removeAttribute('data-font');
        } else {
            root.setAttribute('data-font', font);
        }

        localStorage.setItem('font_preference', font);
    }, [font]);

    // Load theme from DB on mount
    useEffect(() => {
        async function loadTheme() {
            try {
                // First check local storage for instant load
                // First check local storage for instant load
                const stored = localStorage.getItem('theme_preference') as Theme;
                if (stored) {
                    setThemeState(stored);
                }
                const storedFont = localStorage.getItem('font_preference') as Font;
                if (storedFont) {
                    setFontState(storedFont);
                }

                // Then sync with DB if logged in
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('theme_preference, font_preference')
                        .eq('id', user.id)
                        .single();

                    if (data?.theme_preference) {
                        setThemeState(data.theme_preference as Theme);
                        // Update local storage to match DB
                        localStorage.setItem('theme_preference', data.theme_preference);
                    }
                    if (data?.font_preference) {
                        setFontState(data.font_preference as Font);
                        localStorage.setItem('font_preference', data.font_preference);
                    }
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadTheme();
    }, []);

    const setTheme = async (newTheme: Theme) => {
        // Optimistic update
        setThemeState(newTheme);

        try {
            // Persist to DB
            await updateTheme(newTheme);
        } catch (error) {
            console.error('Failed to persist theme:', error);
            // Optional: rollback on error, but maybe not needed for themes
        }
    };

    const setFont = async (newFont: Font) => {
        setFontState(newFont);
        try {
            await updateFont(newFont);
        } catch (error) {
            console.error('Failed to persist font:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, font, setFont, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
