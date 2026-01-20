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
    return (
        <motion.div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(95px) rotate(-${angle}deg)`,
                '--glow-color': color,
            } as any}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            animate={{
                scale: isActive ? 1.3 : 1,
            }}
            onClick={onTap}
            className={`flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-500 ${isActive ? 'shadow-glow' : ''
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
            <div className="flex flex-col items-center mt-3 pointer-events-none">
                <motion.span
                    initial={false}
                    animate={{
                        opacity: isActive ? 1 : 0.8,
                        y: isActive ? 4 : 0,
                    }}
                    className={`text-[10px] font-cinzel font-bold uppercase tracking-[0.2em] ${isActive ? 'text-primary' : 'text-primary/70'}`}
                >
                    {label}
                </motion.span>
                <motion.span
                    initial={false}
                    animate={{
                        opacity: isActive ? 0.8 : 0,
                        scale: isActive ? 1 : 0.8,
                    }}
                    className="text-[9px] font-hindi text-primary/60 mt-0.5"
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
    const jaliX = useSpring(useTransform(accelerometerX, [-30, 30], [-15, 15]), { damping: 30 });
    const jaliY = useSpring(useTransform(accelerometerY, [-30, 30], [-15, 15]), { damping: 30 });

    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.beta !== null) accelerometerY.set(e.beta - 45); // Adjust for typical tilt
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
        }, 300);
    };

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 100 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [-4, 4, -4],
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
                    className="relative w-72 h-72 pointer-events-auto"
                >
                    {/* Background Jali Pattern Reacting to tilt */}
                    <motion.div
                        style={{ x: jaliX, y: jaliY }}
                        className="absolute inset-4 rounded-full jali-pattern opacity-40 blur-[0.5px] pointer-events-none"
                    />

                    {/* Central Mandala Circle */}
                    <motion.div
                        drag="x"
                        onDrag={handleDrag}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        style={{ rotate: springRotation }}
                        className="w-full h-full rounded-full bg-white/5 backdrop-blur-xl border border-white/30 flex items-center justify-center relative overflow-visible shadow-[0_32px_64px_rgba(0,0,0,0.15)] group"
                    >
                        {/* Inner glowing rings */}
                        <div className="absolute inset-8 rounded-full border border-primary/20 animate-pulse" />
                        <div className="absolute inset-16 rounded-full border border-teal/10 rotate-45" />

                        {/* Background pattern */}
                        <div className="absolute inset-0 rounded-full border-[6px] border-dashed border-primary/10 animate-[spin_40s_linear_infinite]" />

                        <div className="w-24 h-24 rounded-full bg-saffron-metallic/10 flex items-center justify-center border border-primary/20 shadow-inner">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="w-12 h-12 rounded-full border-2 border-primary/40 flex items-center justify-center"
                            >
                                <div className="w-2 h-2 rounded-full bg-primary" />
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

                    {/* Interactive hints */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[9px] text-primary/60 font-cinzel font-bold tracking-widest uppercase pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        Explore mandala
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
