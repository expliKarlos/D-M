'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { startTransition } from 'react';

export default function LanguageSelector() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onSelectChange(nextLocale: string) {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    }

    return (
        <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-lg select-none">
            {[
                { id: 'es', label: 'Español' },
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिन्दी', className: 'font-hindi' }
            ].map(({ id, label, className }) => (
                <button
                    key={id}
                    onClick={() => onSelectChange(id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden ${locale === id
                        ? 'bg-primary text-white shadow-md scale-105 z-10'
                        : 'text-slate-600 hover:bg-white/50 hover:text-primary active:scale-95'
                        } ${className || ''}`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
