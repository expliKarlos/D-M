
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MediaCarouselProps {
    mediaUrls: string[];
}

export function MediaCarousel({ mediaUrls }: MediaCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!mediaUrls || mediaUrls.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    };

    // Helper to ensure path starts with /
    const getSrc = (url: string) => url.startsWith('/') ? url : `/${url}`;

    return (
        <div className="relative group rounded-xl overflow-hidden bg-black/5 border border-slate-200">
            <div className="aspect-video relative w-full">
                <Image
                    src={getSrc(mediaUrls[currentIndex])}
                    alt="Infografía informativa"
                    fill
                    className="object-contain" // Use contain to see full infographic
                    sizes="(max-width: 400px) 100vw, 400px"
                />
            </div>

            {/* Controls (only if > 1 image) */}
            {mediaUrls.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow hover:bg-white text-rose-600 transition-opacity opacity-0 group-hover:opacity-100"
                        type="button"
                    >
                        <span className="material-icons-outlined text-sm">chevron_left</span>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full shadow hover:bg-white text-rose-600 transition-opacity opacity-0 group-hover:opacity-100"
                        type="button"
                    >
                        <span className="material-icons-outlined text-sm">chevron_right</span>
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {mediaUrls.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-rose-600' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
