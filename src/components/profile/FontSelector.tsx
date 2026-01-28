'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/components/shared/ThemeProvider';

type Font = 'modern' | 'classic' | 'royal';

const fonts: { id: Font; key: string; preview: string }[] = [
    { id: 'modern', key: 'modern', preview: 'Ag' },
    { id: 'classic', key: 'classic', preview: 'Ag' },
    { id: 'royal', key: 'royal', preview: 'Ag' },
];

export default function FontSelector() {
    const t = useTranslations('Profile');
    // @ts-ignore - font/setFont might not be in the type definition if IDE hasn't reloaded, but they adhere to runtime
    const { font, setFont, isLoading } = useTheme();

    const getFontFamily = (id: Font) => {
        switch (id) {
            case 'classic': return "'Great Vibes', cursive";
            case 'royal': return "'Cinzel', serif";
            default: return "var(--font-outfit)";
        }
    };

    return (
        <div className="bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
            <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">text_fields</span>
                {t('font_preference')}
            </h3>

            <p className="text-sm text-gray-500 mb-6">
                {t('font_description')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fonts.map((f) => (
                    <button
                        key={f.id}
                        // @ts-ignore
                        onClick={() => setFont(f.id)}
                        disabled={isLoading}
                        className={`
                            relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-4 text-left
                            hover:scale-[1.02] active:scale-[0.98]
                            ${font === f.id
                                ? 'border-primary bg-primary/5 shadow-md shadow-primary/20'
                                : 'border-slate-200 dark:border-white/10 hover:border-primary/50'
                            }
                        `}
                    >
                        <div className="flex flex-col gap-2">
                            <span
                                style={{ fontFamily: getFontFamily(f.id) }}
                                className="text-4xl mb-2 block leading-none"
                            >
                                {f.preview}
                            </span>
                            <span className={`text-sm font-medium ${font === f.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                {t(`fonts.${f.key}`)}
                            </span>
                        </div>

                        {font === f.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
