
'use client';

import { useTranslations } from 'next-intl';
import { useChatStore } from '@/lib/store/chat-store';

export default function AssistantCTA() {
    const t = useTranslations('Dashboard');
    const { open } = useChatStore();

    return (
        <div className="bg-card-spain dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center mt-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg mb-6">
                <span className="material-icons-outlined">psychology</span>
            </div>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {t('assistant.title')}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[240px]">
                {t('assistant.description')}
            </p>
            <button
                onClick={open}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-all text-sm cursor-pointer"
            >
                {t('assistant.button')}
            </button>
        </div>
    );
}
