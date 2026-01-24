'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useMergedAgenda, MergedEvent } from '@/hooks/useMergedAgenda';
import { MapPin, Clock, ExternalLink, Calendar, ChevronDown, User, ShieldCheck, Plane, Plus } from 'lucide-react';
import AddEventModal from '@/components/itinerary/AddEventModal';

/**
 * Senior UI Developer Edition - Final Agenda Implementation
 * Merged Itinerary, Country Separators, and Advanced Expandable Cards
 */

export default function AgendaPage() {
    const { eventsByDate, isLoading, error } = useMergedAgenda();
    const sortedDates = useMemo(() => Object.keys(eventsByDate).sort(), [eventsByDate]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Default to today if possible, or first available date
    useEffect(() => {
        if (sortedDates.length > 0 && !selectedDate) {
            setSelectedDate(sortedDates[0]);
        }
    }, [sortedDates, selectedDate]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse italic">Fusionando itinerarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-medium font-cinzel">{error}</p>
            </div>
        );
    }

    const currentEvents = selectedDate ? eventsByDate[selectedDate] : [];

    const handleOpenMap = (event: MergedEvent) => {
        if (!event.coordinates) return;
        const { lat, lng } = event.coordinates;
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const formatDatePill = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' }).replace('.', '');
        return { day, month, monthIndex: date.getMonth(), raw: date };
    };

    return (
        <div className="flex flex-col space-y-6 pb-24 animate-in fade-in duration-700">
            {/* 1. Navegación por Cápsulas con Separador de Destino */}
            <header className="sticky top-0 z-20 -mx-4 px-4 py-4 glass-header border-b border-white/20">
                <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                    {sortedDates.map((date, index) => {
                        const { day, month, monthIndex } = formatDatePill(date);
                        const isSelected = selectedDate === date;

                        // Lógica del separador "Siguiente destino: India"
                        // India suele ser en Septiembre (mes index 8)
                        const prevDate = index > 0 ? formatDatePill(sortedDates[index - 1]) : null;
                        const showIndiaSeparator = prevDate && prevDate.monthIndex < 8 && monthIndex >= 8;

                        return (
                            <React.Fragment key={date}>
                                {showIndiaSeparator && (
                                    <div className="flex items-center gap-3 shrink-0 px-2">
                                        <div className="w-px h-8 bg-slate-200" />
                                        <div className="flex flex-col items-center">
                                            <Plane size={14} className="text-saffron mb-1" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
                                                India
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200" />
                                    </div>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(date)}
                                    className={`
                                        relative flex flex-col items-center justify-center min-w-[65px] h-[75px] rounded-2xl transition-all duration-500
                                        ${isSelected
                                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200/50 ring-2 ring-saffron'
                                            : 'bg-white text-slate-500 border border-slate-100 hover:border-saffron/30 shadow-sm'
                                        }
                                    `}
                                >
                                    <span className={`text-2xl font-black leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                        {day}
                                    </span>
                                    <span className={`text-[10px] uppercase font-black tracking-widest mt-1 ${isSelected ? 'text-saffron' : 'text-slate-400'}`}>
                                        {month}
                                    </span>
                                    {isSelected && (
                                        <motion.div
                                            layoutId="activePillUnderline"
                                            className="absolute -bottom-1.5 w-1 h-1 bg-saffron rounded-full"
                                        />
                                    )}
                                </motion.button>
                            </React.Fragment>
                        );
                    })}
                </div>
            </header>

            {/* 2. Main List with Differentiated Cards */}
            <main className="px-1">
                <LayoutGroup>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDate}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {currentEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onOpenMap={() => handleOpenMap(event)}
                                />
                            ))}

                            {currentEvents.length === 0 && selectedDate && (
                                <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <Calendar className="mx-auto text-slate-300 mb-2 opacity-50" size={40} />
                                    <p className="text-slate-400 font-medium italic">Sin planes para este día.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </LayoutGroup>
            </main>

            {/* 3. Floating Action Button (FAB) */}
            <motion.button
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl z-40 border border-white/20 flex items-center justify-center group"
            >
                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>

            <AddEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialDate={selectedDate}
            />
        </div>
    );
}

function EventCard({ event, onOpenMap }: { event: MergedEvent, onOpenMap: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isOfficial = event.isOfficial;
    const isIndia = event.country === 'India';

    // Estilos basados en el nivel (Nivel 1: Oficial, Nivel 2: Personal)
    const cardStyles = isOfficial
        ? {
            border: 'border-saffron/40',
            bg: 'bg-white',
            accent: 'bg-saffron',
            text: 'text-slate-900',
            titleFont: 'font-cinzel text-lg tracking-tight',
            badge: 'bg-saffron/10 text-saffron border-saffron/20'
        }
        : {
            border: 'border-sky-100',
            bg: 'bg-white/80',
            accent: 'bg-sky-400',
            text: 'text-slate-700',
            titleFont: 'font-bold text-base',
            badge: 'bg-sky-50 text-sky-600 border-sky-100'
        };

    return (
        <motion.div
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
                relative cursor-pointer select-none rounded-2xl border-l-[4px] shadow-sm hover:shadow-md transition-shadow
                ${cardStyles.bg} ${cardStyles.border} ${isOfficial ? 'border-r border-t border-b' : 'border-l-sky-400 border-r border-t border-b border-sky-50'}
            `}
        >
            <div className="p-4 flex flex-col">
                <div className="flex items-start gap-4">
                    {/* Time Column */}
                    <div className="flex flex-col items-center justify-center shrink-0 min-w-[55px]">
                        <Clock size={12} className={isOfficial ? 'text-saffron' : 'text-sky-400'} />
                        <span className="text-lg font-black tabular-nums tracking-tighter mt-1">
                            {event.time || '--:--'}
                        </span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${cardStyles.badge}`}>
                                {isOfficial ? (
                                    <>
                                        <ShieldCheck size={10} />
                                        OFICIAL {isIndia ? '🇮🇳' : '🇪🇸'}
                                    </>
                                ) : (
                                    <>
                                        <User size={10} />
                                        PERSONAL
                                    </>
                                )}
                            </div>
                        </div>

                        <h3 className={`${cardStyles.titleFont} ${cardStyles.text} leading-tight`}>
                            {event.title}
                        </h3>

                        <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                            <MapPin size={12} className="shrink-0" />
                            <span className="text-xs font-medium truncate">{event.location}</span>
                        </div>
                    </div>

                    <div className={`shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={18} className="text-slate-300" />
                    </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-4">
                                {event.description && (
                                    <p className="text-slate-600 text-sm leading-relaxed italic">
                                        "{event.description}"
                                    </p>
                                )}

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenMap();
                                        }}
                                        className={`
                                            flex items-center gap-2 text-[11px] font-black tracking-wider px-4 py-2 rounded-xl transition-all
                                            ${isOfficial
                                                ? 'bg-saffron text-white shadow-lg shadow-saffron/20'
                                                : 'bg-sky-500 text-white shadow-lg shadow-sky-200'
                                            }
                                        `}
                                    >
                                        <ExternalLink size={14} />
                                        VER UBICACIÓN
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
