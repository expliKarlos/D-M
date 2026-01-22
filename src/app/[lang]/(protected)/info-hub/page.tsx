'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getInfoHubImages, type InfoCategory } from '@/lib/actions/info-hub';
import { cn } from '@/lib/utils';

// Helper to preload images in background
const preloadImage = (src: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    return new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // Continue even on error
    });
};

export default function InfoHubPage() {
    const [category, setCategory] = useState<InfoCategory>('Info');
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Determine LCP candidates (first of each category)
    // Since we don't know the full list yet, we'll mark the first one we find.
    const lcpCandidates = useMemo(() => ['/info/info01.png', '/info/ciudad01.png'], []);

    const fetchImages = useCallback(async (cat: InfoCategory) => {
        setIsLoading(true);
        const result = await getInfoHubImages(cat);
        setImages(result);
        if (result.length > 0 && !selectedImage) {
            setSelectedImage(result[0]);
        }
        setIsLoading(false);
    }, [selectedImage]);

    useEffect(() => {
        fetchImages(category);
    }, [category, fetchImages]);

    // 2. Sequential Pre-load (Other category's first image after 500ms)
    useEffect(() => {
        const timer = setTimeout(async () => {
            const otherCategory: InfoCategory = category === 'Info' ? 'Lugares' : 'Info';
            const otherImages = await getInfoHubImages(otherCategory);
            if (otherImages.length > 0) {
                console.log(`[InfoHub] Preloading first image of ${otherCategory}: ${otherImages[0]}`);
                preloadImage(otherImages[0]);

                // 3. Background Loading (Remaining images sequentially)
                const remainingToLoad = [...otherImages.slice(1)]; // Will be extended with current category below
                const loadAll = async () => {
                    for (const src of remainingToLoad) {
                        await new Promise(r => setTimeout(r, 100)); // Tiny delay between requests
                        preloadImage(src);
                    }
                };
                loadAll();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [category]);

    // Background Load current category thumbnails
    useEffect(() => {
        if (images.length > 0) {
            const thumbnails = images.slice(1);
            const loadThumbs = async () => {
                for (const src of thumbnails) {
                    if (!loadedImages.has(src)) {
                        await preloadImage(src);
                        setLoadedImages(prev => new Set(prev).add(src));
                    }
                }
            };
            loadThumbs();
        }
    }, [images, loadedImages]);

    const handleImageLoad = (src: string) => {
        setLoadedImages(prev => new Set(prev).add(src));
    };

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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            {/* Category-themed Skeleton */}
                            <div
                                className={cn(
                                    "absolute inset-0 transition-opacity duration-700 ease-in-out",
                                    loadedImages.has(selectedImage) ? "opacity-0" : "opacity-100",
                                    category === 'Info'
                                        ? "bg-gradient-to-br from-saffron/20 to-primary/10"
                                        : "bg-gradient-to-br from-teal/20 to-slate-400/10"
                                )}
                            />

                            <Image
                                src={selectedImage}
                                alt="Selected Category Detail"
                                fill
                                priority={lcpCandidates.includes(selectedImage) || selectedImage === images[0]}
                                className={cn(
                                    "object-cover transition-all duration-700 ease-in-out",
                                    loadedImages.has(selectedImage) ? "scale-100 blur-0" : "scale-105 blur-lg"
                                )}
                                onLoad={() => handleImageLoad(selectedImage)}
                                sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setSelectedImage(img)}
                            className={cn(
                                "relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden snap-start transition-all duration-300",
                                "ring-2 ring-transparent",
                                selectedImage === img && "ring-primary ring-offset-2 dark:ring-offset-background-dark scale-110 shadow-xl z-10"
                            )}
                        >
                            {/* Thumbnail Skeleton */}
                            <div
                                className={cn(
                                    "absolute inset-0 z-0",
                                    loadedImages.has(img) ? "hidden" : "block animate-pulse",
                                    category === 'Info' ? "bg-saffron/10" : "bg-teal/10"
                                )}
                            />

                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className={cn(
                                    "object-cover transition-all duration-500",
                                    selectedImage === img ? "scale-110" : "hover:scale-105",
                                    loadedImages.has(img) ? "opacity-100" : "opacity-0"
                                )}
                                onLoad={() => handleImageLoad(img)}
                                sizes="96px"
                            />
                            {selectedImage === img && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-primary text-white p-1 rounded-full shadow-lg scale-75">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
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
