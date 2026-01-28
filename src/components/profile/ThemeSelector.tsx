'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/components/shared/ThemeProvider';

type Theme = 'default' | 'romantic' | 'golden' | 'sage' | 'blue' | 'lavender';

const themes: { id: Theme; name: string; colors: string[] }[] = [
    { id: 'default', name: 'Original', colors: ['#ee6c2b', '#f8f6f6'] },
    { id: 'romantic', name: 'Romantic Pink', colors: ['#DB2777', '#FDF2F8'] },
    { id: 'golden', name: 'Golden Hour', colors: ['#D97706', '#FFFCF5'] },
    { id: 'sage', name: 'Sage Garden', colors: ['#577559', '#F6F9F6'] },
    { id: 'blue', name: 'Dusty Blue', colors: ['#647E96', '#F5F8FA'] },
    { id: 'lavender', name: 'Lavender Dream', colors: ['#8B7E9F', '#FAF8FC'] },
];

export default function ThemeSelector({ lng }: { lng: string }) {
    const t = useTranslations('Profile');
    const { theme, setTheme, isLoading } = useTheme();

    return (
        <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-black/5">
            <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">palette</span>
                {t('theme_preference')}
            </h3>

            <p className="text-sm text-gray-500 mb-6">
                {t('theme_description')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themes.map((tItem) => (
                    <button
                        key={tItem.id}
                        onClick={() => setTheme(tItem.id)}
                        disabled={isLoading}
                        className={`
              relative group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
              ${theme === tItem.id
                                ? 'border-primary bg-primary/5'
                                : 'border-transparent hover:bg-black/5 hover:scale-105'}
            `}
                    >
                        <div className="flex gap-1 shadow-sm rounded-full overflow-hidden p-1 bg-white border border-gray-100">
                            {tItem.colors.map((color, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <span className={`text-sm font-medium ${theme === tItem.id ? 'text-primary' : 'text-gray-600'}`}>
                            {tItem.name}
                        </span>

                        {theme === tItem.id && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
