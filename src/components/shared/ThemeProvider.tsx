'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { updateTheme } from '@/lib/actions/theme-actions';
import { supabase } from '@/lib/services/supabase';

type Theme = 'default' | 'romantic' | 'golden' | 'sage' | 'blue' | 'lavender';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => Promise<void>;
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

    // Load theme from DB on mount
    useEffect(() => {
        async function loadTheme() {
            try {
                // First check local storage for instant load
                const stored = localStorage.getItem('theme_preference') as Theme;
                if (stored) {
                    setThemeState(stored);
                }

                // Then sync with DB if logged in
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('theme_preference')
                        .eq('id', user.id)
                        .single();

                    if (data?.theme_preference) {
                        setThemeState(data.theme_preference as Theme);
                        // Update local storage to match DB
                        localStorage.setItem('theme_preference', data.theme_preference);
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

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
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
