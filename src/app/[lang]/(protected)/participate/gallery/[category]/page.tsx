'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { useGallery } from '@/lib/contexts/GalleryContext';
import LightGalleryView from '@/components/gallery/LightGalleryView';

export default function CategoryGalleryPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations('Participation.gallery');
    const { images } = useGallery();

    const categoryId = params?.category as string;

    const categoryPhotos = useMemo(() => {
        return images
            .filter(p => p.category?.toLowerCase() === categoryId?.toLowerCase())
            .map(p => ({
                id: p.id,
                url: p.url,
                thumbnail: p.url,
                title: t(`categories.${categoryId}`)
            }));
    }, [images, categoryId, t]);

    return (
        <div className="min-h-screen bg-black">
            <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center justify-between text-white">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <h1 className="font-fredoka text-xl capitalize">
                    {t(`categories.${categoryId}`) || categoryId}
                </h1>

                <div className="w-10" />
            </header>

            <main className="p-0">
                {/* 
                    When navigating directly to this route, we show the LightGallery automatically.
                    The specific "instant" requirement for the Hub is met by the Hub redesign,
                    but this handles direct links elegantly.
                */}
                <LightGalleryView
                    images={categoryPhotos}
                    onClose={() => router.push('/participate/gallery')}
                />
            </main>
        </div>
    );
}
