'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Navigation, Car, Music, Utensils } from 'lucide-react';

const EVENTS = [
    {
        id: 'sangeet',
        title: 'Noche de Sangeet',
        date: '18 Sep, 2026',
        time: '19:00',
        location: 'Jaipur Palace Garden',
        type: 'Ceremonia',
        icon: <Music size={18} />,
        coords: { lat: 26.9124, lng: 75.7873 },
        desc: 'Bailes, música y cena tradicional bajo las estrellas de Rajastán.'
    },
    {
        id: 'wedding',
        title: 'Boda Pheras Reales',
        date: '20 Sep, 2026',
        time: '10:00',
        location: 'Lake View Temple',
        type: 'Boda',
        icon: <Calendar size={18} />,
        coords: { lat: 26.9650, lng: 75.8591 },
        desc: 'La unión sagrada en el templo del lago, seguida de un banquete real.'
    },
    {
        id: 'cocktail',
        title: 'Cóctel de Bienvenida',
        date: '21 Sep, 2026',
        time: '20:30',
        location: 'Skyline Terrace',
        type: 'Fiesta',
        icon: <Utensils size={18} />,
        coords: { lat: 26.9200, lng: 75.8000 },
        desc: 'Celebración final con vistas a la ciudad rosa.'
    }
];

export default function Agenda() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleUberLink = (lat: number, lng: number) => {
        // Uber deep link format
        window.open(`uber://?client_id=YOUR_CLIENT_ID&action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`, '_blank');
    };

    const handleOlaLink = (lat: number, lng: number) => {
        // Ola deep link format
        window.open(`olacabs://booking?lat=${lat}&lng=${lng}`, '_blank');
    };

    return (
        <div className="py-6 overflow-hidden">
            <header className="mb-10">
                <h2 className="text-3xl font-cinzel font-bold text-slate-900 mb-2">Agenda Real</h2>
                <p className="text-slate-500 text-sm">Organiza tus traslados con un solo toque.</p>
            </header>

            <div className="relative pl-8">
                {/* Timeline main line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-saffron via-teal to-primary/20 rounded-full" />

                <div className="space-y-12">
                    {EVENTS.map((event, index) => (
                        <div key={event.id} className="relative">
                            {/* Timeline Dot */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-teal z-10 shadow-sm"
                            />

                            <div className="flex flex-col gap-4">
                                <div
                                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                                    className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer ${expandedId === event.id
                                            ? 'bg-white border-teal shadow-xl shadow-teal/5 ring-4 ring-teal/5'
                                            : 'bg-white/50 border-slate-100 hover:border-teal/30 shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-teal uppercase tracking-widest">{event.date} • {event.time}</span>
                                            <h3 className="text-xl font-cinzel font-bold text-slate-900 mt-1">{event.title}</h3>
                                        </div>
                                        <div className="p-3 bg-teal/5 rounded-2xl text-teal">
                                            {event.icon}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                        <MapPin size={16} />
                                        <span>{event.location}</span>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === event.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-sm text-slate-600 leading-relaxed mt-4 border-t border-slate-50 pt-4">
                                                    {event.desc}
                                                </p>

                                                <div className="flex flex-col gap-3 mt-6">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pedir transporte</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUberLink(event.coords.lat, event.coords.lng);
                                                            }}
                                                            className="flex items-center justify-center gap-2 py-3 px-4 bg-black text-white rounded-2xl text-xs font-bold transition-transform active:scale-95 shadow-md shadow-black/10"
                                                        >
                                                            <Navigation size={14} />
                                                            UBER
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOlaLink(event.coords.lat, event.coords.lng);
                                                            }}
                                                            className="flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 text-white rounded-2xl text-xs font-bold transition-transform active:scale-95 shadow-md shadow-teal-500/10"
                                                        >
                                                            <Car size={14} />
                                                            OLA
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
