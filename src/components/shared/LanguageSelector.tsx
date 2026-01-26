'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { startTransition } from 'react';

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    function onSelectChange(nextLocale: string) {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    }

    return (
        <div className={`flex bg-white/40 backdrop-blur-md ${compact ? 'p-1 rounded-xl' : 'p-1.5 rounded-2xl'} border border-white/20 shadow-lg select-none`}>
            {[
                { id: 'es', label: 'ES' },
                { id: 'en', label: 'EN' },
                { id: 'hi', label: 'HI', className: 'font-hindi' }
            ].map(({ id, label, className }) => (
                <button
                    key={id}
                    onClick={() => onSelectChange(id)}
                    className={`${compact ? 'px-3 py-1.5' : 'px-4 py-2'} rounded-lg text-[10px] font-bold transition-all duration-300 relative overflow-hidden ${locale === id
                        ? 'bg-[#FF9933] text-white shadow-sm'
                        : 'text-slate-500 hover:bg-white/50 hover:text-primary'
                        } ${className || ''}`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
