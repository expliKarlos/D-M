"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isPWAInstalled, presentInstallPrompt } from "@/lib/utils/pwa";
import { useTranslations } from 'next-intl';

export default function InstallBanner() {
    const t = useTranslations('Dashboard');
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (isPWAInstalled()) {
            setIsVisible(false);
            return;
        }

        // Check if user dismissed for this session
        const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        const handleInstallable = (e: any) => {
            if (e.detail === true && !isPWAInstalled()) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        const handleInstalled = () => {
            setIsVisible(false);
        };

        window.addEventListener("pwa-installable", handleInstallable);
        window.addEventListener("pwa-installed", handleInstalled);

        return () => {
            window.removeEventListener("pwa-installable", handleInstallable);
            window.removeEventListener("pwa-installed", handleInstalled);
        };
    }, []);

    const handleInstall = async () => {
        const success = await presentInstallPrompt();
        if (success) {
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        sessionStorage.setItem("pwa-banner-dismissed", "true");
    };

    if (isDismissed) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-4 right-4 z-[100] md:max-w-md md:mx-auto"
                >
                    <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-4 flex items-center justify-between border border-orange-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <span className="material-symbols-outlined">install_mobile</span>
                            </div>
                            <div>
                                <h3 className="text-[#1a1a1a] font-bold text-sm leading-tight">{t('pwa.title')}</h3>
                                <p className="text-slate-500 text-[11px]">{t('pwa.subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleInstall}
                                className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
                            >
                                {t('pwa.button')}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
