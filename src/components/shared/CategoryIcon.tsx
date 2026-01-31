'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
    url?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeConfig = {
    sm: { container: 'w-12 h-12', text: 'text-lg' },
    md: { container: 'w-20 h-20', text: 'text-3xl' },
    lg: { container: 'w-28 h-28', text: 'text-5xl' },
    xl: { container: 'w-36 h-36', text: 'text-6xl' },
};

export default function CategoryIcon({
    url,
    name,
    size = 'md',
    className
}: CategoryIconProps) {
    const initial = name.charAt(0).toUpperCase();
    const currentSize = sizeConfig[size];

    // If it's a URL (starts with /, http, or contains .)
    const isUrl = url && (url.startsWith('/') || url.startsWith('http') || url.includes('.'));

    return (
        <div className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-full",
            currentSize.container,
            className
        )}>
            {isUrl ? (
                <div className="relative w-full h-full">
                    <Image
                        src={url}
                        alt={name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
            ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Watercolor Circle Fallback */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100 opacity-60 rounded-full"
                        style={{
                            filter: 'contrast(1.1) brightness(1.05)',
                            backgroundImage: 'url("https://www.transparenttextures.com/patterns/watercolor.png")',
                            backgroundBlendMode: 'multiply'
                        }}
                    />
                    <span className={cn(
                        "relative z-10 font-cinzel text-orange-900/60 font-bold",
                        currentSize.text
                    )}>
                        {url && !isUrl ? url : initial}
                    </span>
                </div>
            )}
        </div>
    );
}
