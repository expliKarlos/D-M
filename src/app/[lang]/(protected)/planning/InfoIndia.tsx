'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Footprints, Wind, Sparkles, Trophy } from 'lucide-react';
import { useGamificationStore } from '@/lib/store/gamification-store';
import Confetti from '@/components/shared/Confetti';

const PROTOCOLS = [
    {
        id: 'hand',
        title: 'La Mano Derecha',
        hindi: 'दायां हाथ',
        desc: 'Usa siempre la mano derecha para comer, dar dinero o saludar. La izquierda se considera impura.',
        icon: <Hand className="text-saffron" size={24} />,
        color: 'border-saffron/20 bg-saffron/5',
        highlightColor: 'ring-4 ring-saffron/30 border-saffron bg-saffron/10 scale-105'
    },
    {
        id: 'shoes',
        title: 'Calzado Fuera',
        hindi: 'जूते उतारें',
        desc: 'Quítate los zapatos antes de entrar en hogares, templos e incluso algunas tiendas. Sandalias cómodas son clave.',
        icon: <Footprints className="text-teal" size={24} />,
        color: 'border-teal/20 bg-teal/5'
    },
    {
        id: 'shanti',
        title: 'Actitud Shanti',
        hindi: 'शांति',
        desc: 'Paciencia infinita. El caos no es un error, es parte de la experiencia. Fluye con él, no luches.',
        icon: <Wind className="text-primary" size={24} />,
        color: 'border-primary/20 bg-primary/5'
    },
    {
        id: 'dress',
        title: 'Vestimenta Social',
        hindi: 'वेशभूषा',
        desc: 'Cubre hombros y rodillas en lugares sagrados. Un pañuelo (foulard) es tu mejor aliado.',
        icon: <Sparkles className="text-amber-500" size={24} />,
        color: 'border-amber-500/20 bg-amber-500/5'
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function InfoIndia() {
    const [isMealTime, setIsMealTime] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const { addLoveTokens, addBadge, badges } = useGamificationStore();
    const observerRef = useRef<HTMLDivElement>(null);
    const awardClaimed = useRef(false);

    useEffect(() => {
        // Mood-Based Tips (IA): Detect Meal Time
        const checkMealTime = () => {
            const hours = new Date().getHours();
            const isMeal = (hours >= 12 && hours <= 15) || (hours >= 19 && hours <= 22);
            setIsMealTime(isMeal);
        };

        checkMealTime();
        const interval = setInterval(checkMealTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Gamification Trigger: Scroll to bottom
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !awardClaimed.current && !badges.includes('explorador')) {
                    awardClaimed.current = true;
                    setShowConfetti(true);
                    addLoveTokens(10);
                    addBadge('explorador');
                    setTimeout(() => setShowConfetti(false), 5000);
                }
            },
            { threshold: 1.0 }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [addLoveTokens, addBadge, badges]);

    return (
        <div className="py-6 min-h-[120vh]"> {/* Forced height for scroll trigger */}
            <AnimatePresence>
                {showConfetti && <Confetti />}
            </AnimatePresence>

            <header className="mb-8">
                <h2 className="text-3xl font-cinzel font-bold text-slate-900 mb-2">Respeto & Cultura</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Pequeños gestos que abren grandes puertas. La etiqueta social en India es un arte de respeto.
                </p>
            </header>

            {isMealTime && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 rounded-2xl bg-saffron/10 border border-saffron/20 flex items-center gap-3"
                >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Sparkles className="text-saffron" size={18} />
                    </div>
                    <p className="text-xs font-bold text-saffron-metallic uppercase tracking-wider">
                        ¡Es hora de comer! Recuerda el protocolo de mano derecha.
                    </p>
                </motion.div>
            )}

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                {PROTOCOLS.map((p, i) => {
                    const isHighlighted = p.id === 'hand' && isMealTime;
                    return (
                        <motion.div
                            key={i}
                            variants={item}
                            className={`p-6 rounded-3xl border ${isHighlighted ? p.highlightColor : p.color} backdrop-blur-sm flex flex-col gap-4 hover:shadow-lg transition-all duration-300 group`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                                    {p.icon}
                                </div>
                                <span className="text-[10px] font-hindi text-slate-400 uppercase tracking-widest">{p.hindi}</span>
                            </div>

                            <div>
                                <h3 className="font-cinzel font-bold text-slate-800 mb-1">{p.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {p.desc}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Gamification Sentinel */}
            <div ref={observerRef} className="h-20 mt-10 flex flex-col items-center justify-center gap-4 text-slate-300 border-t border-dashed border-slate-100">
                <Trophy size={32} className={badges.includes('explorador') ? 'text-primary opacity-100' : 'opacity-20'} />
                <p className="text-[10px] uppercase font-bold tracking-widest">
                    {badges.includes('explorador') ? '¡Insignia de Explorador Ganada!' : 'Explora para ganar recompensas'}
                </p>
            </div>
        </div>
    );
}
