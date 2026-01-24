'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ChevronRight, ArrowLeft, Map, Calendar } from 'lucide-react';
import { useWeddingEvents } from '@/hooks/useWeddingEvents';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import type { TimelineEvent } from '@/types/timeline';

export default function PremiumAgendaPage() {
    const { events, isLoading } = useWeddingEvents();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();
    const lang = params?.lang || 'es';

    // Agrupar eventos por fecha localmente para la navegación por cápsulas
    const eventsByDate = useMemo(() => {
        const grouped: Record<string, TimelineEvent[]> = {};
        events.forEach(event => {
            const dateKey = event.fullDate.toISOString().split('T')[0];
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(event);
        });
        return grouped;
    }, [events]);

    const dates = useMemo(() => Object.keys(eventsByDate).sort(), [eventsByDate]);

    useEffect(() => {
        if (dates.length > 0 && !selectedDate) {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(dates.includes(today) ? today : dates[0]);
        }
    }, [dates, selectedDate]);

    const activeEvents = selectedDate ? eventsByDate[selectedDate] : [];

    const formatDateCapsule = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        const day = d.getDate();
        const month = d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).replace('.', '');
        return { day, month };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FDFCFB] pb-20">
            {/* Nav Superior */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-cinzel font-bold text-slate-900">Agenda de la Boda</h1>
                <div className="w-9" />
            </header>

            {/* Cápsulas de Fecha - Scroll Horizontal */}
            <div className="sticky top-[61px] z-30 bg-white/50 backdrop-blur-md border-b border-slate-100 overflow-hidden">
                <div className="flex overflow-x-auto hide-scrollbar px-6 py-5 gap-3 snap-x">
                    {dates.map((dateStr) => {
                        const { day, month } = formatDateCapsule(dateStr);
                        const isSelected = selectedDate === dateStr;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl transition-all duration-300 border snap-center",
                                    isSelected
                                        ? "bg-slate-900 border-slate-900 text-white shadow-xl -translate-y-1"
                                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                )}
                            >
                                <span className="text-xl font-cinzel font-bold leading-none mb-1">{day}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{month}</span>
                                {isSelected && (
                                    <motion.div layoutId="active-dot" className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Lista de Eventos */}
            <div className="max-w-2xl mx-auto px-6 py-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedDate}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                        className="space-y-6"
                    >
                        {activeEvents.map((event) => {
                            const isIndia = event.country === 'India';
                            const titleFont = 'font-[Cinzel]';
                            const subtitleFont = isIndia ? 'font-[Tiro_Devanagari_Hindi]' : 'font-[Cinzel]';

                            return (
                                <motion.div
                                    key={event.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                                >
                                    {/* Barra Oro Lateral - Admin Style */}
                                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#D4AF37]" />

                                    <div className="p-6 pl-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-1">
                                                    <Clock size={12} className="opacity-70" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <h3 className={cn(titleFont, "text-xl font-bold text-slate-900 leading-tight")}>
                                                    {event.title}
                                                </h3>
                                                <p className={cn(subtitleFont, "text-sm text-slate-500 opacity-80")}>
                                                    {event.location}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-[#D4AF37]/5 text-[#D4AF37] rounded-2xl">
                                                <Calendar size={20} />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedId === event.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="text-slate-600 text-sm leading-relaxed pt-4 border-t border-slate-50 mt-4 font-outfit">
                                                        {event.description}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex items-center gap-2 pt-6 mt-2 border-t border-slate-50">
                                            <button
                                                onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold transition-all"
                                            >
                                                {expandedId === event.id ? 'Cerrar' : 'Ver detalles'}
                                                <ChevronRight size={14} className={cn("transition-transform", expandedId === event.id && "rotate-90")} />
                                            </button>

                                            {event.coordinates && (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 active:scale-95 transition-transform"
                                                    title="Ver en Mapa"
                                                >
                                                    <Map size={20} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
