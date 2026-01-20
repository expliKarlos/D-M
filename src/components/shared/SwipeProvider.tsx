'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface SwipeProviderProps {
    children: React.ReactNode;
    activeTab: string | null;
    tabs: { id: string }[];
    onNavigate: (id: string) => void;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
};

export default function SwipeProvider({ children, activeTab, tabs, onNavigate }: SwipeProviderProps) {
    const [direction, setDirection] = useState(0);

    // Find current index
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);

    const paginate = (newDirection: number) => {
        const nextIndex = currentIndex + newDirection;
        if (nextIndex >= 0 && nextIndex < tabs.length) {
            setDirection(newDirection);
            onNavigate(tabs[nextIndex].id);
        }
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Check for map exclusion: if clicking/dragging on a map or 'no-swipe' area
        const target = event.target as HTMLElement;
        if (target.closest('.no-swipe') || target.closest('[data-no-swipe="true"]')) {
            return;
        }

        const swipeThreshold = 50;
        if (info.offset.x < -swipeThreshold) {
            paginate(1);
        } else if (info.offset.x > swipeThreshold) {
            paginate(-1);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={activeTab || 'initial'}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
                        opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="w-full h-full touch-pan-y will-change-transform" // Hardware acceleration
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
