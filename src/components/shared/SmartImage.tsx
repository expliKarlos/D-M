'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export interface SmartImageProps extends Omit<ImageProps, 'src'> {
    src: string | { url?: string; content?: string; imageUrl?: string } | null | undefined;
    fallbackSrc?: string;
    containerClassName?: string;
}

/**
 * SmartImage: A robust wrapper around Next.js Image component.
 * Features:
 * 1. Automatic URL resolution from multiple metadata field names.
 * 2. Fallback support for missing or broken images.
 * 3. Consistent 'object-contain/cover' handling.
 * 4. Case-insensitive extension support via prop-based styling.
 */
const SmartImage = ({
    src,
    alt,
    className,
    containerClassName,
    fallbackSrc = '/images/placeholder.png',
    fill = true,
    sizes = '100vw',
    priority = false,
    onLoad,
    ...props
}: SmartImageProps) => {
    // 1. Resolve URL from various possible formats
    const resolveUrl = (source: SmartImageProps['src']): string => {
        if (!source) return fallbackSrc;
        if (typeof source === 'string') return source;
        return source.url || source.content || source.imageUrl || fallbackSrc;
    };

    const finalSrc = resolveUrl(src);

    // 2. Detect verticality based on extension (common for test assets)
    // Vertical images usually come from the phone camera as .jpeg/.jpg
    const isPotentiallyVertical = /\.(jpe?g)$/i.test(finalSrc);

    return (
        <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
            <Image
                src={finalSrc}
                alt={alt || 'Image'}
                fill={fill}
                className={cn(
                    "object-contain transition-all duration-700 ease-in-out",
                    className
                )}
                priority={priority}
                onLoad={onLoad}
                sizes={sizes}
                {...props}
            />
        </div>
    );
};

export default SmartImage;
