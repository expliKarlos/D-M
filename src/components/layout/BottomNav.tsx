
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useChatStore } from '@/lib/store/chat-store';

export default function BottomNav() {
    const t = useTranslations('Dashboard');
    const { open, close } = useChatStore();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    return (
        <>
            {/* Floating Action Button (Central) */}
            <div className="fixed bottom-[34px] left-1/2 -translate-x-1/2 z-[60]">
                <button
                    onClick={open}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_8px_25px_rgba(238,108,43,0.4)] active:scale-95 transition-transform border-4 border-white cursor-pointer hover:bg-primary/90"
                >
                    <span
                        className="material-symbols-outlined text-3xl"
                        style={{
                            fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48",
                        }}
                    >
                        auto_awesome
                    </span>
                </button>
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-4 py-3 pb-8 flex justify-between items-center z-50">
                <div className="flex w-[40%] justify-around">
                    <button
                        onClick={() => {
                            close();
                            router.push(`/${locale}`);
                        }}
                        className={`flex flex-col items-center gap-1 transition-transform hover:scale-105 ${pathname === `/${locale}` ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                    >
                        <span className="material-icons-outlined">home</span>
                        <span className="text-[10px] font-bold">{t('nav.home')}</span>
                    </button>
                    <button
                        onClick={() => {
                            close();
                            router.push(`/${locale}/enlace`);
                        }}
                        className={`flex flex-col items-center gap-1 transition-transform hover:scale-105 ${pathname.includes('/enlace') ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                    >
                        <span className="material-icons-outlined">favorite_border</span>
                        <span className="text-[10px] font-medium">{t('nav.wedding')}</span>
                    </button>
                </div>
                <div className="w-16"></div>
                <div className="flex w-[40%] justify-around">
                    <button
                        onClick={() => {
                            close();
                            router.push(`/${locale}/participa`);
                        }}
                        className={`flex flex-col items-center gap-1 transition-transform hover:scale-105 ${pathname.includes('/participa') ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                    >
                        <span className="material-icons-outlined">celebration</span>
                        <span className="text-[10px] font-medium">{t('nav.participate')}</span>
                    </button>
                    <button
                        onClick={() => {
                            close();
                            router.push(`/${locale}/planning`);
                        }}
                        className={`flex flex-col items-center gap-1 transition-transform hover:scale-105 ${pathname.includes('/planning') ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                    >
                        <span className="material-icons-outlined">event_note</span>
                        <span className="text-[10px] font-medium">{t('nav.planning')}</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
