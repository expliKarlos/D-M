'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getInfoHubImages, type InfoCategory } from '@/lib/actions/info-hub';
import { cn } from '@/lib/utils';

export default function InfoHubPage() {
    const [category, setCategory] = useState<InfoCategory>('Info');
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchImages = useCallback(async (cat: InfoCategory) => {
        setIsLoading(true);
        const result = await getInfoHubImages(cat);
        setImages(result);
        if (result.length > 0) {
            setSelectedImage(result[0]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchImages(category);
    }, [category, fetchImages]);

    return (
        <div className="flex flex-col min-h-[calc(100dvh-64px)] bg-background-light dark:bg-background-dark pb-24 overflow-hidden">
            {/* 1. Header (Tabs) */}
            <div className="sticky top-0 z-20 w-full glass-header px-4 py-3 flex gap-2">
                <button
                    onClick={() => setCategory('Info')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden",
                        category === 'Info'
                            ? "text-white bg-primary shadow-lg shadow-primary/20"
                            : "text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-white/5"
                    )}
                >
                    {category === 'Info' && (
                        <motion.div
                            layoutId="tab-active"
                            className="absolute inset-0 bg-primary -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    Info
                </button>
                <button
                    onClick={() => setCategory('Lugares')}
                    className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden",
                        category === 'Lugares'
                            ? "text-white bg-primary shadow-lg shadow-primary/20"
                            : "text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-white/5"
                    )}
                >
                    {category === 'Lugares' && (
                        <motion.div
                            layoutId="tab-active"
                            className="absolute inset-0 bg-primary -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    Lugares
                </button>
            </div>

            {/* 2. Featured Image (60-70% height) */}
            <div className="relative flex-1 w-full min-h-[50vh] max-h-[70vh] bg-slate-200 dark:bg-slate-800 overflow-hidden group">
                <AnimatePresence mode="wait">
                    {selectedImage ? (
                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <Image
                                src={selectedImage}
                                alt="Selected Category Detail"
                                fill
                                priority
                                className="object-cover"
                                sizes="100vw"
                            />
                            {/* Subtle Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                        </motion.div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. Bottom Strip (Thumbnails) */}
            <div className="w-full px-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Galería {category}
                    </h3>
                    <span className="text-xs text-slate-400">
                        {images.length} fotos
                    </span>
                </div>

                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x">
                    {images.map((img, idx) => (
                        <motion.button
                            key={img}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedImage(img)}
                            className={cn(
                                "relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden snap-start transition-all duration-300",
                                "ring-2 ring-transparent",
                                selectedImage === img && "ring-primary ring-offset-2 dark:ring-offset-background-dark scale-105 shadow-xl"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className={cn(
                                    "object-cover transition-transform duration-500",
                                    selectedImage === img ? "scale-110" : "hover:scale-105"
                                )}
                                sizes="96px"
                            />
                            {selectedImage === img && (
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                    <div className="bg-primary text-white p-1 rounded-full shadow-lg">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
