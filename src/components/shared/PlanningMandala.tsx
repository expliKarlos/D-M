'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Info, Map, Calendar, User } from 'lucide-react';

interface SectorProps {
    label: string;
    hindiLabel: string;
    icon: React.ReactNode;
    angle: number;
    color: string;
    isActive: boolean;
    onTap: () => void;
}

const Sector = ({ label, hindiLabel, icon, angle, color, isActive, onTap }: SectorProps) => {
    // Calculate position based on angle
    const radius = 100; // Increased radius for better spread
    const radian = (angle - 90) * (Math.PI / 180);
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return (
        <motion.div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                x: x - 28, // Subtract half of width (14 * 4 / 2 = 28)
                y: y - 28, // Subtract half of height
                '--glow-color': color,
            } as any}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            animate={{
                scale: isActive ? 1.3 : 1,
            }}
            onClick={onTap}
            className={`flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-500 w-14 h-14 ${isActive ? 'shadow-glow' : ''
                }`}
        >
            <div
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2 overflow-hidden ${isActive
                    ? 'bg-saffron-metallic border-white scale-110 shadow-xl'
                    : 'bg-white/90 border-primary/20 text-primary hover:border-primary/50'
                    }`}
            >
                <div className={isActive ? 'text-white drop-shadow-md' : 'text-primary'}>
                    {icon}
                </div>
            </div>

            {/* Label outside the orbital path */}
            <div
                className="absolute flex flex-col items-center pointer-events-none"
                style={{
                    top: y > 0 ? '70px' : '-45px',
                    width: '120px'
                }}
            >
                <motion.span
                    initial={false}
                    animate={{
                        opacity: isActive ? 1 : 0.8,
                        y: isActive ? 2 : 0,
                    }}
                    className={`text-[10px] font-cinzel font-bold uppercase tracking-[0.2em] whitespace-nowrap ${isActive ? 'text-primary border-b border-primary/30 pb-0.5' : 'text-primary/70'}`}
                >
                    {label}
                </motion.span>
                <motion.span
                    initial={false}
                    animate={{
                        opacity: isActive ? 0.8 : 0,
                        scale: isActive ? 1 : 0.8,
                    }}
                    className="text-[9px] font-hindi text-primary/60 mt-1"
                >
                    {hindiLabel}
                </motion.span>
            </div>
        </motion.div>
    );
};

export default function PlanningMandala() {
    const [activeSector, setActiveSector] = useState<number | null>(null);
    const router = useRouter();
    const params = useParams();
    const lang = params.lang || 'es';
    const rotation = useMotionValue(0);
    const springRotation = useSpring(rotation, { stiffness: 100, damping: 20 });

    // Antigravity Accelerometer Logic
    const accelerometerX = useMotionValue(0);
    const accelerometerY = useMotionValue(0);
    const jaliX = useSpring(useTransform(accelerometerX, [-30, 30], [-20, 20]), { damping: 30 });
    const jaliY = useSpring(useTransform(accelerometerY, [-30, 30], [-20, 20]), { damping: 30 });

    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.beta !== null) accelerometerY.set(e.beta - 45);
            if (e.gamma !== null) accelerometerX.set(e.gamma);
        };

        if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [accelerometerX, accelerometerY]);

    const sectors = [
        { label: 'Info India', hindiLabel: 'भारत जानकारी', icon: <Map size={22} />, color: '#ee6c2b', href: `/${lang}/info-india` },
        { label: 'Info Útil', hindiLabel: 'उपयोगी जानकारी', icon: <Info size={22} />, color: '#008080', href: `/${lang}/info-util` },
        { label: 'Agenda', hindiLabel: 'कार्यक्रम', icon: <Calendar size={22} />, color: '#10b981', href: `/${lang}/planning` },
        { label: 'Mis Datos', hindiLabel: 'मेरे डेटा', icon: <User size={22} />, color: '#8b5cf6', href: `/${lang}/my-data` },
    ];

    const handleDrag = (_: any, info: any) => {
        rotation.set(rotation.get() + info.delta.x * 0.5);
    };

    const handleSectorTap = (index: number) => {
        setActiveSector(index);
        setTimeout(() => {
            router.push(sectors[index].href);
            // Reset active sector after navigation to avoid visual stuck
            setTimeout(() => setActiveSector(null), 500);
        }, 300);
    };

    return (
        <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 z-[40] pointer-events-none">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 100 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [-6, 6, -6],
                    }}
                    transition={{
                        opacity: { duration: 0.6 },
                        scale: { type: 'spring', damping: 18 },
                        y: {
                            repeat: Infinity,
                            duration: 5,
                            ease: "easeInOut"
                        }
                    }}
                    className="relative w-80 h-80 pointer-events-auto"
                >
                    {/* Background Jali Pattern Reacting to tilt */}
                    <motion.div
                        style={{ x: jaliX, y: jaliY }}
                        className="absolute inset-8 rounded-full jali-pattern opacity-40 blur-[0.5px] pointer-events-none"
                    />

                    {/* Central Mandala Circle */}
                    <motion.div
                        drag="x"
                        onDrag={handleDrag}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        style={{ rotate: springRotation }}
                        className="w-full h-full rounded-full bg-white/10 backdrop-blur-2xl border border-white/40 flex items-center justify-center relative shadow-[0_48px_100px_rgba(0,0,0,0.18)] group"
                    >
                        {/* Decorative Rings */}
                        <div className="absolute inset-10 rounded-full border border-primary/20 animate-pulse" />
                        <div className="absolute inset-20 rounded-full border-[0.5px] border-teal/10 rotate-12" />

                        {/* Outer Spinning Border */}
                        <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-primary/30 animate-[spin_60s_linear_infinite]" />

                        {/* Core */}
                        <div className="w-28 h-28 rounded-full bg-saffron-metallic/5 flex items-center justify-center border border-primary/15 shadow-inner backdrop-blur-md">
                            <motion.div
                                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center"
                            >
                                <div className="w-3 h-3 rounded-full bg-primary/80 blur-[1px]" />
                            </motion.div>
                        </div>

                        {/* Sectors */}
                        {sectors.map((sector, index) => {
                            const angle = (index / sectors.length) * 360;
                            return (
                                <Sector
                                    key={sector.label}
                                    label={sector.label}
                                    hindiLabel={sector.hindiLabel}
                                    icon={sector.icon}
                                    angle={angle}
                                    color={sector.color}
                                    isActive={activeSector === index}
                                    onTap={() => handleSectorTap(index)}
                                />
                            );
                        })}
                    </motion.div>

                    {/* Floating hint */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-[10px] text-primary/70 font-cinzel font-bold tracking-[0.3em] uppercase pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 text-center w-full">
                        Touch to Explore
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
