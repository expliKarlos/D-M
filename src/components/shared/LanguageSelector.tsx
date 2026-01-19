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
        <div className="flex bg-white/50 p-1 rounded-full border border-slate-200 shadow-sm">
            <button
                onClick={() => onSelectChange('en')}
                disabled={locale === 'en'}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${locale === 'en'
                    ? 'bg-primary text-white font-bold'
                    : 'text-slate-500 hover:text-primary'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => onSelectChange('es')}
                disabled={locale === 'es'}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${locale === 'es'
                    ? 'bg-primary text-white font-bold'
                    : 'text-slate-500 hover:text-primary'
                    }`}
            >
                ES
            </button>
            <button
                onClick={() => onSelectChange('hi')}
                disabled={locale === 'hi'}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${locale === 'hi'
                    ? 'bg-primary text-white font-bold'
                    : 'text-slate-500 hover:text-primary'
                    }`}
            >
                HI
            </button>
        </div>
    );
}
