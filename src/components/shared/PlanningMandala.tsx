'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Info, Map, Calendar, User } from 'lucide-react';

interface SectorProps {
    id: string; // Adding ID for layoutId
    label: string;
    hindiLabel: string;
    icon: React.ReactNode;
    angle: number;
    color: string;
    isActive: boolean;
    isCollapsed: boolean;
    onTap: () => void;
}

const Sector = ({ id, label, hindiLabel, icon, angle, color, isActive, isCollapsed, onTap }: SectorProps) => {
    // Calculate position based on angle
    const radius = isCollapsed ? 40 : 100; // Radius shrinks when collapsed
    const radian = (angle - 90) * (Math.PI / 180);
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return (
        <motion.div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                x: x - (isCollapsed ? 16 : 28),
                y: y - (isCollapsed ? 16 : 28),
                '--glow-color': color,
            } as any}
            whileHover={isCollapsed ? {} : { scale: 1.15 }}
            whileTap={isCollapsed ? {} : { scale: 0.9 }}
            animate={{
                scale: isActive ? 1.3 : 1,
            }}
            onClick={onTap}
            className={`flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-500 ${isCollapsed ? 'w-8 h-8' : 'w-14 h-14'
                } ${isActive ? 'shadow-glow' : ''}`}
        >
            <motion.div
                layoutId={`icon-bg-${id}`}
                className={`${isCollapsed ? 'w-8 h-8 border' : 'w-14 h-14 border-2'
                    } rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${isActive
                        ? 'bg-saffron-metallic border-white scale-110 shadow-xl'
                        : 'bg-white/90 border-primary/20 text-primary hover:border-primary/50'
                    }`}
            >
                <motion.div
                    layoutId={`icon-${id}`}
                    className={isActive ? 'text-white drop-shadow-md' : 'text-primary'}
                >
                    {React.cloneElement(icon as React.ReactElement<any>, { size: isCollapsed ? 14 : 22 })}
                </motion.div>
            </motion.div>

            {/* Label outside the orbital path */}
            {!isCollapsed && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                    </motion.div>
                </AnimatePresence>
            )}
        </motion.div>
    );
};

interface PlanningMandalaProps {
    activeTab?: string | null;
    onNavigate?: (id: string) => void;
    isCollapsed?: boolean;
}

export default function PlanningMandala({ activeTab, onNavigate, isCollapsed = false }: PlanningMandalaProps) {
    const [localActiveSector, setLocalActiveSector] = useState<number | null>(null);
    const router = useRouter();
    const params = useParams();
    const lang = params.lang || 'es';
    const rotation = useMotionValue(0);
    // Custom Spring for "Senior" feel: higher stiffness, lower damping for that bounce/oscillation
    const springRotation = useSpring(rotation, { stiffness: 200, damping: 15, mass: 1 });

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
        { id: 'india', label: 'Info India', hindiLabel: 'भारत जानकारी', icon: <Map />, color: '#ee6c2b', href: `/${lang}/planning?tab=india` },
        { id: 'spain', label: 'Info España', hindiLabel: 'स्पेन जानकारी', icon: <Info />, color: '#AA151B', href: `/${lang}/planning?tab=spain` },
        { id: 'util', label: 'Info Útil', hindiLabel: 'उपयोगी जानकारी', icon: <Info />, color: '#008080', href: `/${lang}/planning?tab=util` },
        { id: 'agenda', label: 'Agenda', hindiLabel: 'कार्यक्रम', icon: <Calendar />, color: '#10b981', href: `/${lang}/planning?tab=agenda` },
        { id: 'mis-datos', label: 'Mis Datos', hindiLabel: 'मेरे डेटा', icon: <User />, color: '#8b5cf6', href: `/${lang}/profile` },
    ];

    const currentTabId = activeTab || sectors[localActiveSector ?? -1]?.id;

    // Expert Auto-rotation logic: Always points the active sector UP (0 deg)
    useEffect(() => {
        if (activeTab) {
            const index = sectors.findIndex(s => s.id === activeTab);
            if (index !== -1) {
                // To bring the sector at 'angle' to the top (0 deg), we rotate by -angle
                const targetAngle = -(index * 90);
                rotation.set(targetAngle);
            }
        } else {
            // Default center if no tab is active (Initial state)
            rotation.set(0);
        }
    }, [activeTab]);

    const handleDrag = (_: any, info: any) => {
        if (isCollapsed) return;
        rotation.set(rotation.get() + info.delta.x * 0.5);
    };

    const handleSectorTap = (index: number) => {
        if (isCollapsed) return;
        setLocalActiveSector(index);

        if (onNavigate) {
            onNavigate(sectors[index].id);
        } else {
            setTimeout(() => {
                router.push(sectors[index].href);
                setTimeout(() => setLocalActiveSector(null), 1000);
            }, 300);
        }
    };

    return (
        <div className={`transition-all duration-700 ${isCollapsed
            ? 'absolute -top-10 -left-10 z-0'
            : 'fixed bottom-[110px] left-1/2 -translate-x-1/2 z-[40]'
            } pointer-events-none`}
        >
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 100 }}
                    animate={{
                        opacity: 1,
                        scale: isCollapsed ? 0.6 : 1,
                        y: isCollapsed ? 0 : [-6, 6, -6],
                    }}
                    transition={{
                        opacity: { duration: 0.6 },
                        scale: { type: 'spring', damping: 25, stiffness: 200 },
                        y: {
                            repeat: isCollapsed ? 0 : Infinity,
                            duration: 5,
                            ease: "easeInOut"
                        }
                    }}
                    className={`${isCollapsed ? 'w-40 h-40' : 'w-80 h-80'} pointer-events-auto relative`}
                >
                    {/* Background Jali Pattern Reacting to tilt */}
                    {!isCollapsed && (
                        <motion.div
                            style={{ x: jaliX, y: jaliY }}
                            className="absolute inset-8 rounded-full jali-pattern opacity-40 blur-[0.5px] pointer-events-none"
                        />
                    )}

                    {/* Central Mandala Circle */}
                    <motion.div
                        layoutId="mandala-backdrop"
                        drag={isCollapsed ? false : "x"}
                        onDrag={handleDrag}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        style={{ rotate: springRotation }}
                        className={`w-full h-full rounded-full bg-white/10 backdrop-blur-2xl border border-white/40 flex items-center justify-center relative shadow-[0_48px_100px_rgba(0,0,0,0.18)] group transition-shadow duration-700 ${isCollapsed ? 'shadow-none' : ''
                            }`}
                    >
                        {/* Decorative Rings */}
                        {!isCollapsed && (
                            <>
                                <div className="absolute inset-10 rounded-full border border-primary/20 animate-pulse" />
                                <div className="absolute inset-20 rounded-full border-[0.5px] border-teal/10 rotate-12" />
                                <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-primary/30 animate-[spin_60s_linear_infinite]" />
                            </>
                        )}

                        {/* Core */}
                        <div className={`${isCollapsed ? 'w-12 h-12' : 'w-28 h-28'} rounded-full bg-saffron-metallic/5 flex items-center justify-center border border-primary/15 shadow-inner backdrop-blur-md`}>
                            <motion.div
                                animate={isCollapsed ? { scale: 1 } : { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: isCollapsed ? 0 : Infinity, duration: 4 }}
                                className={`${isCollapsed ? 'w-6 h-6' : 'w-16 h-16'} rounded-full border border-primary/30 flex items-center justify-center`}
                            >
                                <div className={`${isCollapsed ? 'w-1.5 h-1.5' : 'w-3 h-3'} rounded-full bg-primary/80 blur-[1px]`} />
                            </motion.div>
                        </div>

                        {/* Sectors */}
                        {sectors.map((sector, index) => {
                            const angle = (index / sectors.length) * 360;
                            return (
                                <Sector
                                    key={sector.id}
                                    id={sector.id}
                                    label={sector.label}
                                    hindiLabel={sector.hindiLabel}
                                    icon={sector.icon}
                                    angle={angle}
                                    color={sector.color}
                                    isActive={currentTabId === sector.id}
                                    isCollapsed={isCollapsed}
                                    onTap={() => handleSectorTap(index)}
                                />
                            );
                        })}
                    </motion.div>

                    {/* Floating hint */}
                    {!isCollapsed && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-[10px] text-primary/70 font-cinzel font-bold tracking-[0.3em] uppercase pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 text-center w-full">
                            Touch to Explore
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
