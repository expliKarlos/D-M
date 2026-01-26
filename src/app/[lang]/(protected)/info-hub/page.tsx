'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import SmartImage from '@/components/shared/SmartImage';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize, Search, X, ChevronLeft } from 'lucide-react';
import { getInfoHubImages, type InfoCategory } from '@/lib/actions/info-hub';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

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

const ZOOM_STEP = 0.5;

export default function InfoHubPage() {
    const t = useTranslations('InfoHub');
    const [category, setCategory] = useState<InfoCategory>('Info');
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);

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

    // Reset zoom when image changes
    useEffect(() => {
        if (transformComponentRef.current) {
            transformComponentRef.current.resetTransform();
        }
    }, [selectedImage]);

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

    const [isZoomed, setIsZoomed] = useState(false);

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
                    {t('tabs.info')}
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
                    {t('tabs.places')}
                </button>
            </div>

            {/* 2. Zoomable Featured Image (ZoomableHeader) */}
            <div className="relative flex-1 w-full min-h-[50vh] max-h-[70vh] bg-slate-900 dark:bg-black overflow-hidden group">
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
                            {/* Blurred Backdrop */}
                            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                                <SmartImage
                                    src={selectedImage!}
                                    alt="backdrop"
                                    fill
                                    className="object-cover blur-3xl opacity-30 saturate-150 scale-110"
                                    priority={false}
                                />
                            </div>

                            {/* Zoom Pan Pinch Wrapper */}
                            <TransformWrapper
                                ref={transformComponentRef}
                                initialScale={1}
                                minScale={1}
                                maxScale={8}
                                centerOnInit
                                doubleClick={{ step: 1, mode: "toggle" }} // Double-tap/click to toggle between 1x and 2x
                                wheel={{ step: 0.1 }}
                                limitToBounds={true}
                                alignmentAnimation={{ sizeX: 0, sizeY: 0 }} // Elastic bounce behavior
                                onTransformed={(ref) => {
                                    const zoomed = ref.state.scale > 1.05;
                                    if (zoomed !== isZoomed) setIsZoomed(zoomed);
                                }}
                            >
                                {({ zoomIn, zoomOut, resetTransform }) => (
                                    <>
                                        {/* Floating Controls */}
                                        <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
                                            <button
                                                onClick={() => zoomIn(ZOOM_STEP)}
                                                className="w-10 h-10 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-white/20 hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-white"
                                                title={t('controls.zoom_in')}
                                            >
                                                <ZoomIn size={20} />
                                            </button>
                                            <button
                                                onClick={() => zoomOut(ZOOM_STEP)}
                                                className="w-10 h-10 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-white/20 hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-white"
                                                title={t('controls.zoom_out')}
                                            >
                                                <ZoomOut size={20} />
                                            </button>
                                            <button
                                                onClick={() => resetTransform()}
                                                className="w-10 h-10 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-white/20 hover:scale-110 active:scale-95 transition-all text-slate-800 dark:text-white"
                                                title={t('controls.reset')}
                                            >
                                                <Maximize size={20} />
                                            </button>
                                        </div>

                                        <TransformComponent
                                            wrapperClass={cn(
                                                "!w-full !h-full transition-all duration-300",
                                                isZoomed ? "!cursor-grabbing" : "!cursor-zoom-in"
                                            )}
                                            contentClass="!w-full !h-full flex items-center justify-center"
                                        >
                                            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                                                <SmartImage
                                                    src={selectedImage!}
                                                    alt="Main Info View"
                                                    fill
                                                    priority={lcpCandidates.includes(selectedImage!) || selectedImage === images[0]}
                                                    className={cn(
                                                        "object-contain transition-all duration-700 ease-in-out",
                                                        loadedImages.has(selectedImage!) ? "scale-100 blur-0" : "scale-105 blur-lg"
                                                    )}
                                                    onLoad={() => handleImageLoad(selectedImage!)}
                                                    sizes="100vw"
                                                />
                                            </div>
                                        </TransformComponent>
                                    </>
                                )}
                            </TransformWrapper>
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
                        {t('gallery_title', { category: category === 'Info' ? t('tabs.info') : t('tabs.places') })}
                    </h3>
                    <span className="text-xs text-slate-400">
                        {t('images_count', { count: images.length })}
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
