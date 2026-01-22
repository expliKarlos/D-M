'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SmartImageProps extends Omit<ImageProps, 'src'> {
    src: string | { url?: string; content?: string; imageUrl?: string } | null | undefined;
    fallbackSrc?: string;
    containerClassName?: string;
    children?: React.ReactNode;
}

const SmartImage = motion(React.forwardRef<HTMLDivElement, SmartImageProps>(({
    src,
    alt,
    className,
    containerClassName,
    fallbackSrc = '/images/placeholder.png',
    fill = true,
    sizes = '100vw',
    priority = false,
    unoptimized = false,
    onLoad,
    children,
    ...props
}, ref) => {
    const resolveUrl = (source: SmartImageProps['src']): string => {
        if (!source) return fallbackSrc;
        if (typeof source === 'string') return source;
        return source.url || source.content || source.imageUrl || fallbackSrc;
    };

    const finalSrc = resolveUrl(src);

    return (
        <motion.div
            ref={ref}
            className={cn("relative w-full h-full overflow-hidden", containerClassName)}
            {...(props as any)}
        >
            <Image
                src={finalSrc}
                alt={alt || 'Image'}
                fill={fill}
                className={cn(
                    "object-contain transition-all duration-700 ease-in-out",
                    className
                )}
                priority={priority}
                unoptimized={unoptimized}
                onLoad={onLoad}
                sizes={sizes}
            />
            {children}
        </motion.div>
    );
}));

SmartImage.displayName = 'SmartImage';

export default SmartImage;
