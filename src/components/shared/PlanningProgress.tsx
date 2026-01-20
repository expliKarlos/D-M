'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PlanningProgressProps {
    currentIndex: number;
    total: number;
}

export default function PlanningProgress({ currentIndex, total }: PlanningProgressProps) {
    return (
        <div className="flex gap-1.5 px-6 py-3 w-full max-w-md mx-auto">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className="h-1 flex-1 bg-slate-200 rounded-full overflow-hidden relative"
                >
                    <motion.div
                        initial={false}
                        animate={{
                            width: i <= currentIndex ? '100%' : '0%',
                            backgroundColor: i === currentIndex ? '#ee6c2b' : '#008080'
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                            delay: i === currentIndex ? 0.1 : 0
                        }}
                        className="absolute inset-0 h-full"
                    />
                </div>
            ))}
        </div>
    );
}
