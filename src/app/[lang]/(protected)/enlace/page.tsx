'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Calendar, Clock } from 'lucide-react';

interface Event {
    date: string;
    time: string;
    title: string;
    location: string;
    description: string;
    image: string;
    country: 'España' | 'India';
}

const events: Event[] = [
    {
        date: '15 de Febrero, 2026',
        time: '18:00',
        title: 'Ceremonia Civil',
        location: 'Ayuntamiento de Madrid',
        description: 'Celebración oficial de nuestra unión en el corazón de Madrid, rodeados de familia y amigos cercanos.',
        image: '/info/ciudad01.png',
        country: 'España'
    },
    {
        date: '20 de Febrero, 2026',
        time: '10:00',
        title: 'Mehndi Ceremony',
        location: 'Hotel Taj Palace, Nueva Delhi',
        description: 'Ceremonia tradicional india de henna, donde las mujeres de la familia adornan sus manos con hermosos diseños.',
        image: '/info/info01.png',
        country: 'India'
    },
    {
        date: '21 de Febrero, 2026',
        time: '19:00',
        title: 'Sangeet Night',
        location: 'Jardines del Taj Palace',
        description: 'Noche de música, baile y celebración. Familias de ambos lados presentarán actuaciones especiales.',
        image: '/info/info02.png',
        country: 'India'
    },
    {
        date: '22 de Febrero, 2026',
        time: '09:00',
        title: 'Ceremonia Hindu',
        location: 'Templo Akshardham, Delhi',
        description: 'Ceremonia tradicional hindú con todos los rituales sagrados que unen a nuestras familias para siempre.',
        image: '/info/info03.png',
        country: 'India'
    },
    {
        date: '22 de Febrero, 2026',
        time: '20:00',
        title: 'Recepción de Gala',
        location: 'Salón Imperial, Taj Palace',
        description: 'Gran celebración con cena, música en vivo y baile hasta el amanecer. Dress code: Formal/Tradicional.',
        image: '/info/ciudad02.png',
        country: 'India'
    },
    {
        date: '23 de Febrero, 2026',
        time: '12:00',
        title: 'Brunch de Despedida',
        location: 'Terraza del Hotel',
        description: 'Último encuentro relajado con todos nuestros invitados antes de partir hacia nuevas aventuras.',
        image: '/info/info04.png',
        country: 'India'
    }
];

interface TimelineNodeProps {
    event: Event;
    index: number;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ event, index }) => {
    const isEven = index % 2 === 0;
    const countryColor = event.country === 'España' ? 'from-red-500 to-yellow-500' : 'from-orange-500 to-pink-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-center mb-16 md:mb-24"
        >
            {/* Mobile: Image always on top */}
            <div className="md:hidden w-full">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className={`absolute top-4 right-4 px-4 py-2 rounded-full bg-gradient-to-r ${countryColor} text-white text-xs font-bold shadow-lg`}>
                        {event.country}
                    </div>
                </div>
            </div>

            {/* Desktop: Left side (Text or Image based on index) */}
            <div className={`hidden md:block ${isEven ? 'text-right' : 'order-3'}`}>
                {isEven ? (
                    // Text on left
                    <div className="pr-8">
                        <div className="inline-block">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${countryColor} text-white text-sm font-bold mb-4 shadow-lg`}>
                                <MapPin size={16} />
                                {event.country}
                            </div>
                        </div>
                        <h3 className="font-fredoka text-3xl text-slate-900 mb-3">{event.title}</h3>
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
                        <p className="text-slate-500 text-sm flex items-center justify-end gap-2">
                            <MapPin size={14} />
                            {event.location}
                        </p>
                    </div>
                ) : (
                    // Image on left
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="50vw"
                        />
                    </div>
                )}
            </div>

            {/* Center: Timeline dot and line */}
            <div className="absolute left-0 md:relative md:left-auto flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br ${countryColor} shadow-lg border-4 border-white z-10`}
                />
            </div>

            {/* Desktop: Right side (Image or Text based on index) */}
            <div className={`hidden md:block ${!isEven ? 'text-left' : 'order-1'}`}>
                {!isEven ? (
                    // Text on right
                    <div className="pl-8">
                        <div className="inline-block">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${countryColor} text-white text-sm font-bold mb-4 shadow-lg`}>
                                <MapPin size={16} />
                                {event.country}
                            </div>
                        </div>
                        <h3 className="font-fredoka text-3xl text-slate-900 mb-3">{event.title}</h3>
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
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                            <MapPin size={14} />
                            {event.location}
                        </p>
                    </div>
                ) : (
                    // Image on right
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                        <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="50vw"
                        />
                    </div>
                )}
            </div>

            {/* Mobile: Text content */}
            <div className="md:hidden pl-10">
                <div className="inline-block mb-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${countryColor} text-white text-xs font-bold shadow-lg`}>
                        <MapPin size={14} />
                        {event.country}
                    </div>
                </div>
                <h3 className="font-fredoka text-2xl text-slate-900 mb-3">{event.title}</h3>
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
                <p className="text-slate-500 text-xs flex items-center gap-2">
                    <MapPin size={12} />
                    {event.location}
                </p>
            </div>
        </motion.div>
    );
};

export default function EnlacePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-purple-50 pb-24 font-outfit">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-20 px-4">
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
            <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-16">
                {/* Vertical Line - Desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 via-pink-300 to-purple-300 -translate-x-1/2" />

                {/* Vertical Line - Mobile */}
                <div className="md:hidden absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 via-pink-300 to-purple-300" />

                {/* Events */}
                {events.map((event, index) => (
                    <TimelineNode key={index} event={event} index={index} />
                ))}

                {/* End decoration */}
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="flex justify-center md:justify-center ml-0 md:ml-0"
                >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl border-4 border-white flex items-center justify-center">
                        <span className="text-2xl">💕</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
