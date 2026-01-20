'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Info, Map, Calendar, User } from 'lucide-react';

interface SectorProps {
    label: string;
    icon: React.ReactNode;
    angle: number;
    color: string;
    isActive: boolean;
    onTap: () => void;
}

const Sector = ({ label, icon, angle, color, isActive, onTap }: SectorProps) => {
    return (
        <motion.div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(85px) rotate(-${angle}deg)`,
                '--glow-color': color,
            } as any}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
                scale: isActive ? 1.25 : 1,
            }}
            onClick={onTap}
            className={`flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-500 ${isActive ? 'shadow-glow' : ''
                }`}
        >
            <div
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-white/80 text-primary hover:bg-white'
                    }`}
            >
                {icon}
            </div>
            <motion.span
                initial={false}
                animate={{
                    opacity: isActive ? 1 : 0.7,
                    y: isActive ? 6 : 0,
                    scale: isActive ? 1.1 : 1
                }}
                className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-primary/60'}`}
            >
                {label}
            </motion.span>
        </motion.div>
    );
};

export default function PlanningMandala() {
    const [activeSector, setActiveSector] = useState<number | null>(null);
    const rotation = useMotionValue(0);
    const springRotation = useSpring(rotation, { stiffness: 100, damping: 20 });

    const sectors = [
        { label: 'Info India', icon: <Map size={24} />, color: '#ee6c2b' },
        { label: 'Info Útil', icon: <Info size={24} />, color: '#3b82f6' },
        { label: 'Agenda', icon: <Calendar size={24} />, color: '#10b981' },
        { label: 'Mis Datos', icon: <User size={24} />, color: '#8b5cf6' },
    ];

    const handleDrag = (_: any, info: any) => {
        // Basic inertial drag mapping horizontal movement to rotation
        rotation.set(rotation.get() + info.delta.x * 0.5);
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 100 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [-5, 5, -5],
                    }}
                    transition={{
                        opacity: { duration: 0.5 },
                        scale: { type: 'spring', damping: 15 },
                        y: {
                            repeat: Infinity,
                            duration: 4,
                            ease: "easeInOut"
                        }
                    }}
                    className="relative w-64 h-64 pointer-events-auto"
                >
                    {/* Central Mandala Circle */}
                    <motion.div
                        drag="x"
                        onDrag={handleDrag}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        style={{ rotate: springRotation }}
                        className="w-full h-full rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative overflow-visible shadow-2xl group"
                    >
                        {/* Background pattern */}
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-[spin_20s_linear_infinite]" />

                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                        </div>

                        {/* Sectors */}
                        {sectors.map((sector, index) => {
                            const angle = (index / sectors.length) * 360;
                            return (
                                <Sector
                                    key={sector.label}
                                    label={sector.label}
                                    icon={sector.icon}
                                    angle={angle}
                                    color={sector.color}
                                    isActive={activeSector === index}
                                    onTap={() => setActiveSector(index)}
                                />
                            );
                        })}
                    </motion.div>

                    {/* Interactive hints */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] text-primary/40 whitespace-nowrap font-medium tracking-widest uppercase pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        Spin to navigate
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
