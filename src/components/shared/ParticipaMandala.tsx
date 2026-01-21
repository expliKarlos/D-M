'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Sparkles, Image as ImageIcon, Gamepad2 } from 'lucide-react';

interface SectorProps {
    id: string;
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
    const radius = isCollapsed ? 40 : 100;
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
                layoutId={`holi-icon-bg-${id}`}
                className={`${isCollapsed ? 'w-8 h-8 border' : 'w-14 h-14 border-2'
                    } rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${isActive
                        ? 'bg-gradient-to-br from-[#FF6B35] to-[#F21B6A] border-white scale-110 shadow-xl'
                        : 'bg-white/90 border-fuchsia-100 text-[#F21B6A] hover:border-[#F21B6A]/50'
                    }`}
            >
                <motion.div
                    layoutId={`holi-icon-${id}`}
                    className={isActive ? 'text-white drop-shadow-md' : 'text-[#F21B6A]'}
                >
                    {React.cloneElement(icon as React.ReactElement<any>, { size: isCollapsed ? 14 : 22 })}
                </motion.div>
            </motion.div>

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
                            className={`text-[10px] font-fredoka font-bold uppercase tracking-[0.2em] whitespace-nowrap ${isActive ? 'text-[#F21B6A] border-b border-[#F21B6A]/30 pb-0.5' : 'text-[#F21B6A]/70'}`}
                        >
                            {label}
                        </motion.span>
                        <motion.span
                            initial={false}
                            animate={{
                                opacity: isActive ? 0.8 : 0,
                                scale: isActive ? 1 : 0.8,
                            }}
                            className="text-[9px] font-hindi text-[#F21B6A]/60 mt-1"
                        >
                            {hindiLabel}
                        </motion.span>
                    </motion.div>
                </AnimatePresence>
            )}
        </motion.div>
    );
};

interface ParticipaMandalaProps {
    activeTab?: string | null;
    onNavigate?: (id: string) => void;
    isCollapsed?: boolean;
    rotationValue?: any; // To allow external components to react to rotation
}

export default function ParticipaMandala({ activeTab, onNavigate, isCollapsed = false, rotationValue }: ParticipaMandalaProps) {
    const [localActiveSector, setLocalActiveSector] = useState<number | null>(null);
    const router = useRouter();
    const params = useParams();
    const lang = params.lang || 'es';

    // Internal rotation if none provided
    const internalRotation = useMotionValue(0);
    const rotation = rotationValue || internalRotation;
    const springRotation = useSpring(rotation, { stiffness: 150, damping: 20, mass: 1 });

    const accelerometerX = useMotionValue(0);
    const accelerometerY = useMotionValue(0);
    const flowX = useSpring(useTransform(accelerometerX, [-30, 30], [-15, 15]), { damping: 30 });
    const flowY = useSpring(useTransform(accelerometerY, [-30, 30], [-15, 15]), { damping: 30 });

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
        { id: 'muro', label: 'Muro', hindiLabel: 'शुभकामनाएं', icon: <Sparkles />, color: '#FF6B35', href: `/${lang}/participa?tab=muro` },
        { id: 'galeria', label: 'Galería', hindiLabel: 'गैलरी', icon: <ImageIcon />, color: '#F21B6A', href: `/${lang}/participa?tab=galeria` },
        { id: 'juegos', label: 'Juegos', hindiLabel: 'खेल', icon: <Gamepad2 />, color: '#FFD100', href: `/${lang}/participa?tab=juegos` },
    ];

    useEffect(() => {
        if (activeTab) {
            const index = sectors.findIndex(s => s.id === activeTab);
            if (index !== -1) {
                const targetAngle = -(index * (360 / sectors.length));
                rotation.set(targetAngle);
            }
        } else {
            rotation.set(0);
        }
    }, [activeTab]);

    const handleDrag = (_: any, info: any) => {
        if (isCollapsed) return;
        rotation.set(rotation.get() + info.delta.x * 0.6);
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
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{
                        opacity: 1,
                        scale: isCollapsed ? 0.6 : 1,
                        y: isCollapsed ? 0 : [-4, 4, -4],
                    }}
                    transition={{
                        opacity: { duration: 0.6 },
                        scale: { type: 'spring', damping: 25, stiffness: 200 },
                        y: {
                            repeat: isCollapsed ? 0 : Infinity,
                            duration: 4,
                            ease: "easeInOut"
                        }
                    }}
                    className={`${isCollapsed ? 'w-40 h-40' : 'w-80 h-80'} pointer-events-auto relative`}
                >
                    {/* Holi Powder Clouds (CSS-based) */}
                    {!isCollapsed && (
                        <div className="absolute inset-0 overflow-visible">
                            <motion.div
                                style={{ x: flowX, y: flowY }}
                                className="absolute -inset-10 bg-gradient-to-br from-[#FF6B35]/10 to-[#F21B6A]/10 rounded-full blur-3xl"
                            />
                            <motion.div
                                style={{ x: flowY, y: flowX }}
                                className="absolute -inset-4 bg-gradient-to-tr from-[#FFD100]/10 to-transparent rounded-full blur-2xl"
                            />
                        </div>
                    )}

                    {/* Central Holi Mandala */}
                    <motion.div
                        layoutId="holi-mandala-backdrop"
                        drag={isCollapsed ? false : "x"}
                        onDrag={handleDrag}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        style={{ rotate: springRotation }}
                        className={`w-full h-full rounded-full bg-white/20 backdrop-blur-xl border border-white/50 flex items-center justify-center relative shadow-[0_32px_80px_rgba(242,27,106,0.15)] group transition-shadow duration-700 ${isCollapsed ? 'shadow-none' : ''
                            }`}
                    >
                        {/* Decorative Rings - Holi Style */}
                        {!isCollapsed && (
                            <>
                                <div className="absolute inset-4 rounded-full border border-fuchsia-200/30 border-dashed animate-[spin_40s_linear_infinite]" />
                                <div className="absolute inset-12 rounded-full border-[0.5px] border-[#FFD100]/20 rotate-45" />
                                <div className="absolute inset-0 rounded-full border-[2px] border-dotted border-[#FF6B35]/30 animate-[spin_80s_linear_infinite_reverse]" />
                            </>
                        )}

                        {/* Core */}
                        <div className={`${isCollapsed ? 'w-12 h-12' : 'w-28 h-28'} rounded-full bg-[#F21B6A]/5 flex items-center justify-center border border-[#F21B6A]/15 shadow-inner backdrop-blur-md overflow-hidden relative group`}>
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B35]/20 to-[#F21B6A]/20 opacity-40 group-hover:opacity-60 transition-opacity" />

                            <motion.div
                                animate={isCollapsed ? { scale: 1 } : { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: isCollapsed ? 0 : Infinity, duration: 6 }}
                                className={`${isCollapsed ? 'w-6 h-6' : 'w-16 h-16'} rounded-full border border-fuchsia-300/40 flex items-center justify-center relative z-10`}
                            >
                                <div className={`${isCollapsed ? 'w-2 h-2' : 'w-4 h-4'} rounded-full bg-[#F21B6A] shadow-[0_0_15px_rgba(242,27,106,0.8)]`} />
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
                                    isActive={activeTab === sector.id}
                                    isCollapsed={isCollapsed}
                                    onTap={() => handleSectorTap(index)}
                                />
                            );
                        })}
                    </motion.div>

                    {/* Floating hint */}
                    {!isCollapsed && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-[10px] text-[#F21B6A] font-fredoka font-bold tracking-[0.3em] uppercase pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 text-center w-full">
                            Colorea la Celebración
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
