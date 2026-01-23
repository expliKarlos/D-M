'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import SmartImage from '@/components/shared/SmartImage';
import { MapPin, Calendar, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { useTimeline } from '@/lib/contexts/TimelineContext';
import type { TimelineEvent } from '@/types/timeline';

interface TimelineNodeProps {
    event: TimelineEvent;
    index: number;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ event, index }) => {
    const isEven = index % 2 === 0;
    const countryColor = event.country === 'Valladolid' ? 'from-red-600 to-amber-600' : 'from-orange-500 to-pink-500';
    const fontFamily = event.country === 'Valladolid' ? 'font-[Cinzel]' : 'font-[Tiro_Devanagari_Hindi]';
    const isPriority = index < 2;
    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

    const openInMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}`;
        window.open(url, '_blank');
    };

    // Lateral slide direction based on index
    const slideDirection = isEven ? -100 : 100;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: slideDirection }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: index * 0.1
            }}
            className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-center mb-16 md:mb-24"
        >
            {/* Mobile: Image always on top */}
            <div className="md:hidden w-full">
                <motion.div
                    style={{ y }}
                    className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                >
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={isPriority}
                    />
                    <div className={`absolute top-4 right-4 px-4 py-2 rounded-full bg-gradient-to-r ${countryColor} text-white text-xs font-bold shadow-lg ${fontFamily}`}>
                        {event.country}
                    </div>
                </motion.div>
            </div>

            {/* Desktop: Left side */}
            <div className={`hidden md:block ${isEven ? 'text-right' : 'order-3'}`}>
                {isEven ? (
                    <div className="pr-8">
                        <div className="inline-block">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${countryColor} text-white text-sm font-bold mb-4 shadow-lg ${fontFamily}`}>
                                <MapPin size={16} />
                                {event.country}
                            </div>
                        </div>
                        <h3 className={`${fontFamily} text-3xl text-slate-900 mb-3`}>{event.title}</h3>
                        <div className="flex items-center justify-end gap-4 text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span className="text-sm">{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span className="text-sm">{event.time}</span>
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-3">{event.description}</p>
                        <button
                            onClick={openInMaps}
                            className="text-slate-500 text-sm flex items-center justify-end gap-2 hover:text-orange-500 transition-colors group"
                        >
                            <MapPin size={14} />
                            <span className="underline decoration-dotted">{event.location}</span>
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                ) : (
                    <motion.div
                        style={{ y }}
                        className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                    >
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="50vw"
                            priority={isPriority}
                        />
                    </motion.div>
                )}
            </div>

            {/* Center: Timeline dot */}
            <div className="absolute left-0 md:relative md:left-auto flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br ${countryColor} shadow-lg border-4 border-white z-10`}
                />
            </div>

            {/* Desktop: Right side */}
            <div className={`hidden md:block ${!isEven ? 'text-left' : 'order-1'}`}>
                {!isEven ? (
                    <div className="pl-8">
                        <div className="inline-block">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${countryColor} text-white text-sm font-bold mb-4 shadow-lg ${fontFamily}`}>
                                <MapPin size={16} />
                                {event.country}
                            </div>
                        </div>
                        <h3 className={`${fontFamily} text-3xl text-slate-900 mb-3`}>{event.title}</h3>
                        <div className="flex items-center gap-4 text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span className="text-sm">{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span className="text-sm">{event.time}</span>
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-3">{event.description}</p>
                        <button
                            onClick={openInMaps}
                            className="text-slate-500 text-sm flex items-center gap-2 hover:text-orange-500 transition-colors group"
                        >
                            <MapPin size={14} />
                            <span className="underline decoration-dotted">{event.location}</span>
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                ) : (
                    <motion.div
                        style={{ y }}
                        className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                    >
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="50vw"
                            priority={isPriority}
                        />
                    </motion.div>
                )}
            </div>

            {/* Mobile: Text content */}
            <div className="md:hidden pl-10">
                <div className="inline-block mb-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${countryColor} text-white text-xs font-bold shadow-lg ${fontFamily}`}>
                        <MapPin size={14} />
                        {event.country}
                    </div>
                </div>
                <h3 className={`${fontFamily} text-2xl text-slate-900 mb-3`}>{event.title}</h3>
                <div className="flex flex-col gap-2 text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span className="text-sm">{event.time}</span>
                    </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-3">{event.description}</p>
                <button
                    onClick={openInMaps}
                    className="text-slate-500 text-xs flex items-center gap-2 hover:text-orange-500 transition-colors group"
                >
                    <MapPin size={12} />
                    <span className="underline decoration-dotted">{event.location}</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </motion.div>
    );
};

const CountdownBanner: React.FC = () => {
    const { events } = useTimeline();
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [nextEvent, setNextEvent] = useState<TimelineEvent | null>(null);

    useEffect(() => {
        const calculateCountdown = () => {
            const now = new Date();
            const upcoming = events.find((event: TimelineEvent) => event.fullDate > now);

            if (!upcoming) {
                setNextEvent(null);
                return;
            }

            setNextEvent(upcoming);
            const diff = upcoming.fullDate.getTime() - now.getTime();

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);

        return () => clearInterval(interval);
    }, [events]);

    if (!nextEvent) return null;

    const countryColor = nextEvent.country === 'Valladolid' ? 'from-red-600 to-amber-600' : 'from-orange-500 to-pink-500';
    const fontFamily = nextEvent.country === 'Valladolid' ? 'font-[Cinzel]' : 'font-[Tiro_Devanagari_Hindi]';

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r ${countryColor} text-white py-3 px-4 shadow-lg`}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Clock size={20} className="animate-pulse" />
                    <div>
                        <p className="text-xs opacity-90">Próximo evento</p>
                        <p className={`${fontFamily} text-sm md:text-base font-bold`}>{nextEvent.title}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs opacity-90">Faltan</p>
                    <p className="font-mono text-sm md:text-lg font-bold">{timeLeft}</p>
                </div>
            </div>
        </motion.div>
    );
};


const CountryTransition: React.FC<{ country: string }> = ({ country }) => {
    const gradient = country === 'Valladolid' ? 'from-red-600 to-amber-600' : 'from-orange-500 to-pink-500';
    const fontFamily = country === 'Valladolid' ? 'font-[Cinzel]' : 'font-[Tiro_Devanagari_Hindi]';

    return (
        <div className="sticky top-20 md:top-24 z-30 py-12 my-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.8 }}
                className={`relative overflow-hidden bg-gradient-to-r ${gradient} text-white py-16 px-8 rounded-3xl shadow-2xl`}
            >
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl" />
                </div>
                <div className="relative text-center">
                    <motion.h2
                        initial={{ y: 20 }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        className={`${fontFamily} text-4xl md:text-6xl mb-4`}
                    >
                        {country === 'Valladolid' ? '🇪🇸 Valladolid' : '🇮🇳 India'}
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/90"
                    >
                        {country === 'Valladolid' ? 'Donde comenzó nuestra historia' : 'Donde celebramos nuestra unión'}
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default function EnlacePage() {
    const { events, isLoading, error } = useTimeline();
    const containerRef = useRef(null);
    const indiaRef = useRef(null);
    const [isIndiaSection, setIsIndiaSection] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Intersection Observer for atmospheric transition
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIndiaSection(entry.isIntersecting);
            },
            { threshold: 0.3 }
        );

        if (indiaRef.current) {
            observer.observe(indiaRef.current);
        }

        return () => {
            if (indiaRef.current) {
                observer.unobserve(indiaRef.current);
            }
        };
    }, []);

    const countryChangeIndex = events.findIndex((event: TimelineEvent, index: number) =>
        index > 0 && events[index - 1].country === 'Valladolid' && event.country === 'India'
    );

    return (
        <motion.div
            animate={{
                background: isIndiaSection
                    ? 'linear-gradient(to bottom, rgb(255 247 237), rgb(254 242 242), rgb(250 232 255))'
                    : 'linear-gradient(to bottom, rgb(255 247 237), rgb(253 242 248), rgb(250 232 255))'
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="min-h-screen pb-24 font-outfit"
        >
            <CountdownBanner />

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-pink-500 text-white py-20 px-4 mt-16">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-fredoka text-5xl md:text-6xl mb-4"
                    >
                        Nuestro Enlace
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
                    >
                        Un viaje de amor que une dos culturas, dos familias y dos corazones
                    </motion.p>
                </div>
            </div>

            {/* Timeline Container */}
            <div ref={containerRef} className="relative max-w-6xl mx-auto px-4 md:px-8 py-16">
                {/* Animated Vertical Line - Desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-200 via-orange-200 to-pink-200 -translate-x-1/2">
                    <motion.div
                        style={{ scaleY, transformOrigin: 'top' }}
                        className="w-full h-full bg-gradient-to-b from-red-500 via-orange-500 to-pink-500"
                    />
                </div>

                {/* Animated Vertical Line - Mobile */}
                <div className="md:hidden absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-red-200 via-orange-200 to-pink-200">
                    <motion.div
                        style={{ scaleY, transformOrigin: 'top' }}
                        className="w-full h-full bg-gradient-to-b from-red-500 via-orange-500 to-pink-500"
                    />
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={48} className="animate-spin text-orange-500" />
                        <p className="text-slate-600 font-semibold">Cargando eventos...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                        <p className="text-red-700 font-semibold mb-2">Error al cargar los eventos</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && events.length === 0 && (
                    <div className="text-center py-20">
                        <Calendar size={64} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-600 font-semibold text-lg">No hay eventos programados</p>
                        <p className="text-slate-500 text-sm mt-2">Los eventos aparecerán aquí cuando se añadan</p>
                    </div>
                )}

                {/* Events with Country Transition */}
                {!isLoading && !error && events.length > 0 && events.map((event: TimelineEvent, index: number) => (
                    <React.Fragment key={event.id}>
                        {index === countryChangeIndex && (
                            <div ref={indiaRef}>
                                <CountryTransition country="India" />
                            </div>
                        )}
                        <TimelineNode event={event} index={index} />
                    </React.Fragment>
                ))}

                {/* End decoration */}
                {!isLoading && !error && events.length > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl border-4 border-white flex items-center justify-center">
                            <span className="text-2xl">💕</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
