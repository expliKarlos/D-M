'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { useGallery } from '@/lib/contexts/GalleryContext';
import UploadZone from '../../participa/UploadZone';
import { Camera, ChevronRight } from 'lucide-react';

const CATEGORIES = [
    { id: 'recepcion', icon: '/GalleryIcons/Icono_Recepción.png', translationKey: 'recepcion' },
    { id: 'ceremonia', icon: '/GalleryIcons/Icono_Ceremonia.png', translationKey: 'ceremonia' },
    { id: 'banquete', icon: '/GalleryIcons/Icono_Banquete.png', translationKey: 'banquete' },
    { id: 'fiesta', icon: '/GalleryIcons/Icono_Fiesta.png', translationKey: 'fiesta' },
    { id: 'preboda_india', icon: '/GalleryIcons/Icono_PrebodaIndia.png', translationKey: 'preboda_india' },
    { id: 'otros', icon: '/GalleryIcons/Icono_Otros.png', translationKey: 'otros' },
];

export default function GalleryHubPage() {
    const t = useTranslations('Participation.gallery');
    const router = useRouter();
    const { images, moments } = useGallery();

    // Manage shots state locally like in GaleriaFotos
    const [currentShots, setCurrentShots] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('d-m-app-shots');
            return saved ? parseInt(saved, 10) : 0;
        }
        return 0;
    });
    const maxShots = 10;

    const remainingShots = Math.max(0, maxShots - currentShots);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const handleUploadSuccess = () => {
        const nextShots = currentShots + 1;
        setCurrentShots(nextShots);
        localStorage.setItem('d-m-app-shots', nextShots.toString());
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] pb-32">
            {/* Header / Upload Section */}
            <header className="bg-white/70 backdrop-blur-xl border-b border-orange-50 sticky top-0 z-40 px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-fredoka text-2xl text-slate-900">{t('tab_gallery')}</h1>
                        <p className="font-outfit text-xs text-slate-500">{t('limited_roll.title')}</p>
                    </div>
                </div>

                <UploadZone
                    variant="minimalist"
                    onUploadSuccess={handleUploadSuccess}
                    currentShots={currentShots}
                    maxShots={maxShots}
                    moments={moments}
                />
            </header>

            <main className="px-5 pt-8 max-w-5xl mx-auto">
                {/* Category Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
                >
                    {CATEGORIES.map((cat) => (
                        <motion.button
                            key={cat.id}
                            variants={item}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/participate/gallery/${cat.id}`)}
                            className="group relative bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center overflow-hidden"
                        >
                            {/* Decorative watercolor-like blob behind */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-50/50 rounded-full blur-3xl group-hover:bg-orange-50/50 transition-colors" />

                            <div className="relative w-24 h-24 lg:w-32 lg:h-32 mb-4">
                                <Image
                                    src={cat.icon}
                                    alt={t(`categories.${cat.translationKey}`)}
                                    fill
                                    className="object-contain transform group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>

                            <h3 className="font-fredoka text-lg lg:text-xl text-slate-800 group-hover:text-primary transition-colors">
                                {t(`categories.${cat.translationKey}`)}
                            </h3>

                            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <span>Ver Álbum</span>
                                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Footer Section: Limited Roll Info */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 mb-8 bg-gradient-to-br from-fuchsia-500 to-[#F21B6A] rounded-[2.5rem] p-8 text-white shadow-xl shadow-fuchsia-200 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <Camera size={120} />
                    </div>

                    <div className="relative z-10">
                        <h2 className="font-fredoka text-2xl mb-2">{t('limited_roll.title')}</h2>
                        <p className="font-outfit text-sm opacity-90 mb-6 max-w-xs">
                            {t('limited_roll.desc', { max: maxShots })}
                        </p>

                        <div className="flex items-end gap-4">
                            <div className="text-5xl font-fredoka">{remainingShots}</div>
                            <div className="text-sm font-bold uppercase tracking-widest pb-2 opacity-80">
                                {remainingShots === 1 ? t('shooting') : t('shootings')}
                            </div>
                        </div>

                        {/* Simple Progress Bar */}
                        <div className="mt-6 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(remainingShots / maxShots) * 100}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}
