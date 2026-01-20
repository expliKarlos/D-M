'use client';

import React from 'react';
import { motion } from 'framer-motion';

const colors = ['#f59e0b', '#ee6c2b', '#008080', '#10b981', '#8b5cf6', '#rose-500'];

export default function Confetti() {
    const pieces = Array.from({ length: 50 });

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {pieces.map((_, i) => {
                const color = colors[Math.floor(Math.random() * colors.length)];
                const x = Math.random() * 100;
                const delay = Math.random() * 0.5;
                const duration = 2 + Math.random() * 2;

                return (
                    <motion.div
                        key={i}
                        initial={{
                            top: '-10%',
                            left: `${x}%`,
                            scale: 0.5 + Math.random(),
                            rotate: 0,
                            opacity: 1
                        }}
                        animate={{
                            top: '110%',
                            left: `${x + (Math.random() * 10 - 5)}%`,
                            rotate: 360 * 2,
                            opacity: 0
                        }}
                        transition={{
                            duration,
                            delay,
                            ease: "linear"
                        }}
                        style={{
                            position: 'absolute',
                            width: `${Math.random() * 10 + 5}px`,
                            height: `${Math.random() * 6 + 4}px`,
                            backgroundColor: color,
                            borderRadius: '2px',
                        }}
                    />
                );
            })}
        </div>
    );
}
