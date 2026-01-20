'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, CalendarPlus, Clock } from 'lucide-react';

interface EventProps {
    id: string;
    title: string;
    date: string;
    description: string;
    locationName: string;
    coordinates: { lat: number, lng: number };
    startTime: string;
}

export default function EventCard({ event }: { event: EventProps }) {

    const addToCalendar = () => {
        const { title, date, startTime, locationName } = event;
        // Simple Google Calendar link generation
        const start = `${date.replace(/-/g, '')}T${startTime.replace(/:/g, '')}00Z`;
        const end = `${date.replace(/-/g, '')}T${(parseInt(startTime.split(':')[0]) + 4).toString().padStart(2, '0')}${startTime.split(':')[1]}00Z`; // Default 4 hours

        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(locationName)}`;
        window.open(url, '_blank');
    };

    const openMaps = () => {
        const { lat, lng } = event.coordinates;
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4"
        >
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-2 inline-block">
                        Hito de la Boda
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Clock size={20} />
                </div>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
                {event.description}
            </p>

            <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-sm font-medium">{event.locationName}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                    onClick={openMaps}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-colors"
                >
                    <MapPin size={16} />
                    Ver Mapa
                </button>
                <button
                    onClick={addToCalendar}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl text-sm font-bold transition-colors"
                >
                    <CalendarPlus size={16} />
                    Calendario
                </button>
            </div>
        </motion.div>
    );
}
