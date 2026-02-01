'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useGallery } from '@/lib/contexts/GalleryContext';
import UploadZone from '../../participa/UploadZone';
import { Camera, ChevronRight, X } from 'lucide-react';
import LightGalleryView from '@/components/gallery/LightGalleryView';
import { useRouter } from 'next/navigation';
import CategoryIcon from '@/components/shared/CategoryIcon';

export default function GalleryHubPage() {
    const t = useTranslations('Participation.gallery');
    const { images, moments } = useGallery();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Manage shots state locally
    const [currentShots, setCurrentShots] = useState(0);
    const maxShots = 10;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('d-m-app-shots');
            if (saved) setCurrentShots(parseInt(saved, 10));
        }
    }, []);

    const remainingShots = Math.max(0, maxShots - currentShots);

    const filteredImages = useMemo(() => {
        if (!selectedCategory) return [];
        const moment = moments.find(m => m.id === selectedCategory);
        return images
            .filter(img => img.category?.toLowerCase() === selectedCategory.toLowerCase())
            .map(img => ({
                id: img.id,
                url: img.url,
                url_optimized: img.url_optimized || img.url,
                title: moment?.name || selectedCategory
            }));
    }, [images, selectedCategory, moments]);

    const handleUploadSuccess = () => {
        const nextShots = currentShots + 1;
        setCurrentShots(nextShots);
        localStorage.setItem('d-m-app-shots', nextShots.toString());
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header / Upload Section - Clean & White */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 px-5 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-fredoka text-3xl text-slate-900 tracking-tight">
                            {t('tab_gallery')}
                        </h1>
                        <p className="font-outfit text-sm text-slate-400 font-medium">
                            {t('limited_roll.title')}
                        </p>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                        <span className="font-fredoka text-primary text-lg">{remainingShots}</span>
                        <span className="font-outfit text-[10px] text-slate-400 uppercase font-bold ml-2 tracking-wider">
                            {t('shootings')}
                        </span>
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

            <main className="px-5 pt-10 max-w-6xl mx-auto">
                {/* Dynamic Category Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-8"
                >
                    {moments.map((moment) => (
                        <motion.button
                            key={moment.id}
                            variants={item}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                const count = images.filter(i => i.category?.toLowerCase() === moment.id.toLowerCase()).length;
                                if (count > 0) {
                                    setSelectedCategory(moment.id);
                                } else {
                                    router.push(`/participate/gallery/${moment.id}`);
                                }
                            }}
                            className="group relative bg-[#FDFCFB] rounded-[3.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col items-center justify-center text-center overflow-hidden"
                        >
                            {/* Decorative background blob */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-50" />

                            <div className="relative mb-6">
                                <CategoryIcon
                                    url={moment.icon}
                                    name={moment.name}
                                    size="xl"
                                    className="drop-shadow-sm group-hover:scale-110 transition-transform duration-500 ease-out"
                                />
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-fredoka text-xl text-slate-800 group-hover:text-primary transition-colors">
                                    {moment.name}
                                </h3>
                                <p className="text-[10px] uppercase tracking-widest font-black text-slate-300 group-hover:text-slate-400 transition-colors">
                                    {images.filter(i => i.category?.toLowerCase() === moment.id.toLowerCase()).length} {t('photos_count')}
                                </p>
                            </div>

                            <div className="mt-4 bg-white p-2 rounded-full shadow-sm border border-slate-50 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                <ChevronRight className="text-primary" size={16} />
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* LightGallery Integration */}
                {selectedCategory && (
                    <LightGalleryView
                        images={filteredImages}
                        onClose={() => setSelectedCategory(null)}
                    />
                )}

                {/* Footer Section: Limited Roll Info */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-20 mb-12 bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-colors duration-1000" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="font-fredoka text-3xl mb-3 tracking-tight">
                                {t('limited_roll.title')}
                            </h2>
                            <p className="font-outfit text-base text-slate-400 max-w-sm leading-relaxed">
                                {t('limited_roll.desc', { max: maxShots })}
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <span className="block text-6xl font-fredoka text-white">{remainingShots}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                    {t('shootings')}
                                </span>
                            </div>

                            <div className="w-px h-16 bg-white/10 hidden md:block" />

                            <div className="w-32 h-32 relative">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-white/5"
                                    />
                                    <motion.circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray="283"
                                        initial={{ strokeDashoffset: 283 }}
                                        animate={{ strokeDashoffset: 283 - (283 * remainingShots) / maxShots }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="text-primary drop-shadow-[0_0_8px_rgba(238,108,43,0.5)]"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Camera size={24} className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}
