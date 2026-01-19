
'use client';

import { useTranslations } from 'next-intl';

export default function ShareSection() {
    const t = useTranslations('Dashboard.share');

    const handleShare = async () => {
        const shareUrl = window.location.origin;
        const shareMessage = t('message', { url: shareUrl });
        const shareTitle = t('title');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareMessage,
                    url: shareUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback to WhatsApp
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <section className="px-6 mt-10 mb-8 text-center">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined !text-3xl">share</span>
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-slate-800">{t('button')}</h4>
                    <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                        Envía el enlace a tus invitados para que puedan instalar la app.
                    </p>
                </div>
                <button
                    onClick={handleShare}
                    className="w-full bg-white border border-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl shadow-sm active:scale-95 transition-all text-sm flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-emerald-500">whatsapp</span>
                    WhatsApp / Social
                </button>
            </div>
        </section>
    );
}
