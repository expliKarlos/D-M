'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft, Grid } from 'lucide-react';
import { useGallery } from '@/lib/contexts/GalleryContext';
import SmartImage from '@/components/shared/SmartImage';

export default function CategoryGalleryPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations('Participation.gallery');
    const { images } = useGallery();

    const categoryId = params?.category as string;

    // Filter photos by category (logic to be refined with lightGallery)
    const categoryPhotos = images.filter(p => p.category?.toLowerCase() === categoryId.toLowerCase());

    return (
        <div className="min-h-screen bg-white pb-24">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-50 px-4 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>

                <h1 className="font-fredoka text-xl text-slate-900 capitalize">
                    {t(`categories.${categoryId}`) || categoryId}
                </h1>

                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="p-4">
                {categoryPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {categoryPhotos.map((photo, index) => (
                            <motion.div
                                key={photo.id || index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-50"
                            >
                                <SmartImage
                                    src={photo.url}
                                    alt={`Photo ${index}`}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <Grid size={48} className="mb-4" />
                        <p className="font-outfit text-sm">{t('no_photos')}</p>
                    </div>
                )}
            </main>
        </div>
    );
}
