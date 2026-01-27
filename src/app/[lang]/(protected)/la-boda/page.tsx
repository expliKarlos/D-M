'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
    MapPin,
    ExternalLink,
    ChevronRight,
    Plane,
    Bus,
    Theater,
    Hotel,
    Mail,
    Heart
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Countdown from '@/components/shared/Countdown';

export default function LaBodaPage() {
    const t = useTranslations('LaBoda');
    const td = useTranslations('Dashboard');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const scheduleEvents = [
        { key: 'arrival', emoji: '🍾', color: 'bg-orange-50' },
        { key: 'ceremony', emoji: '⛪', color: 'bg-rose-50' },
        { key: 'cocktail', emoji: '🥂', color: 'bg-amber-50' },
        { key: 'banquet', emoji: '🍽️', color: 'bg-slate-50' },
        { key: 'party', emoji: '💃', color: 'bg-rose-50' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-[#FAF9F6] pb-0 font-outfit text-slate-800">

            {/* Hero Section */}
            <section className="relative h-[40vh] flex flex-col items-center justify-center text-center px-6 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <span className="block text-sm uppercase tracking-[0.3em] text-slate-500 mb-4 font-light">
                        {t('date')}
                    </span>
                    <h1 className="font-cinzel text-5xl md:text-7xl text-slate-900 mb-6 tracking-tight">
                        {t('subtitle')}
                    </h1>
                    <p className="text-slate-500 italic font-light tracking-wide max-w-md mx-auto">
                        "{t('countdown_text')}"
                    </p>
                </motion.div>
            </section>

            {/* Double Countdown Section */}
            <section className="max-w-4xl mx-auto px-6 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Spain Countdown */}
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="bg-white/60 backdrop-blur-sm border border-rose-100 rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={16} className="text-rose-500" />
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {td('spain_card.title')}
                            </h4>
                        </div>
                        <Countdown
                            targetDate="2026-06-12T12:00:00+02:00"
                            labels={{
                                days: td('spain_card.days'),
                                hours: td('spain_card.hours'),
                                minutes: td('spain_card.minutes')
                            }}
                            colorClass="red"
                        />
                    </motion.div>

                    {/* India Countdown */}
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="bg-white/60 backdrop-blur-sm border border-orange-100 rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={16} className="text-orange-500" />
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {td('india_card.title')}
                            </h4>
                        </div>
                        <Countdown
                            targetDate="2026-09-20T12:00:00+05:30"
                            labels={{
                                days: td('india_card.days'),
                                hours: td('india_card.hours'),
                                minutes: td('india_card.minutes')
                            }}
                            colorClass="orange"
                        />
                    </motion.div>
                </div>
            </section>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="max-w-5xl mx-auto px-6 space-y-32"
            >
                {/* Location Section */}
                <section className="text-center space-y-12">
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h2 className="font-cinzel text-3xl md:text-4xl text-slate-900">{t('location.title')}</h2>
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-6 max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                                <MapPin size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{t('location.name')}</h3>
                                <p className="text-slate-500 text-lg">{t('location.address')}</p>
                            </div>
                            <a
                                href={t('location.maps_url')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full text-sm font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all"
                            >
                                <span>Google Maps</span>
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* Schedule Section */}
                <section className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="font-cinzel text-3xl md:text-4xl text-slate-900 leading-tight">
                            {t('schedule.title')}
                        </h2>
                        <p className="text-slate-400 uppercase tracking-[0.2em] text-xs font-medium">
                            {t('schedule.subtitle')}
                        </p>
                    </div>

                    <div className="relative max-w-2xl mx-auto">
                        {/* Timeline Line */}
                        <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-[1px] bg-slate-200" />

                        <div className="space-y-16 relative">
                            {scheduleEvents.map((event, index) => (
                                <motion.div
                                    key={event.key}
                                    variants={itemVariants}
                                    className={`flex items-start md:items-center gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    {/* Desktop Date/Text */}
                                    <div className="md:w-1/2 flex justify-end md:px-12">
                                        <div className={`hidden md:block ${index % 2 === 0 ? 'text-right' : 'text-left w-full'}`}>
                                            <span className="text-sm font-bold text-primary tracking-widest block mb-1">
                                                {t(`schedule.${event.key}.time`)}
                                            </span>
                                            <h4 className="font-bold text-slate-900 mb-1">{t(`schedule.${event.key}.title`)}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">{t(`schedule.${event.key}.text`)}</p>
                                        </div>
                                    </div>

                                    {/* Dot/Icon - Colored and shadowed as per user screenshot */}
                                    <div className={`z-10 w-14 h-14 ${event.color} rounded-full border border-white shadow-md flex items-center justify-center shrink-0 transition-transform hover:scale-110`}>
                                        <span className="text-2xl">{event.emoji}</span>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="md:w-1/2 flex justify-start md:px-12">
                                        <div className="md:hidden">
                                            <span className="text-xs font-bold text-primary tracking-widest block mb-1">
                                                {t(`schedule.${event.key}.time`)}
                                            </span>
                                            <h4 className="font-bold text-slate-900 mb-1">{t(`schedule.${event.key}.title`)}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">{t(`schedule.${event.key}.text`)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Travel & Accommodation - 2 Columns */}
                <section className="space-y-16">
                    <div className="text-center">
                        <h2 className="font-cinzel text-3xl md:text-4xl text-slate-900">{t('travel.title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        {/* Left Column: Accommodation (Single Large Card) */}
                        <motion.div variants={itemVariants} className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-8 h-full">
                            <div className="flex items-center gap-4 text-slate-900 border-b border-slate-50 pb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
                                    <Hotel size={28} />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">{t('travel.accommodation.title')}</h3>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-2">{t('travel.accommodation.in_city.title')}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">{t('travel.accommodation.in_city.text')}</p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900 mb-2">{t('travel.accommodation.near_monastery.title')}</h4>
                                    <p className="text-slate-400 text-xs leading-relaxed italic mb-4">
                                        {t('travel.accommodation.near_monastery.text')}
                                    </p>

                                    <ul className="space-y-4">
                                        {t.raw('travel.accommodation.near_monastery.hotels').map((hotel: any, idx: number) => (
                                            <li key={idx} className="group flex flex-col gap-1 border-l-2 border-slate-100 pl-4 hover:border-primary transition-colors">
                                                <span className="font-bold text-slate-800 group-hover:text-primary transition-colors">{hotel.name}</span>
                                                {hotel.tel && <span className="text-xs text-slate-400">Tel: {hotel.tel}</span>}
                                                {hotel.email && <span className="text-xs text-slate-400">Email: {hotel.email}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Stack of Cards */}
                        <div className="flex flex-col gap-6">
                            {/* How to Get There */}
                            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-500">
                                        <Plane size={24} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">{t('travel.how_to_get.title')}</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('travel.how_to_get.airport.title')}</p>
                                        <p className="text-slate-600 font-medium">{t('travel.how_to_get.airport.text')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('travel.how_to_get.from_madrid.title')}</p>
                                        <p className="text-slate-600 font-medium">{t('travel.how_to_get.from_madrid.text')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('travel.how_to_get.parking.title')}</p>
                                        <p className="text-slate-600 font-medium">{t('travel.how_to_get.parking.text')}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Transportation */}
                            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                                        <Bus size={24} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">{t('travel.transport.title')}</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('travel.transport.buses.title')}</p>
                                        <p className="text-slate-600 font-medium">{t('travel.transport.buses.text')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('travel.transport.taxi.title')}</p>
                                        <p className="text-slate-600 font-medium">{t('travel.transport.taxi.text')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('travel.transport.shuttle.title')}</p>
                                        <p className="text-slate-600 font-medium">{t('travel.transport.shuttle.text')}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Things to Do */}
                            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                                        <Theater size={24} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">{t('travel.things_to_do.title')}</h4>
                                </div>
                                <ul className="space-y-3">
                                    {t.raw('travel.things_to_do.items').map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="space-y-16 pb-32">
                    <div className="text-center">
                        <h2 className="font-cinzel text-3xl md:text-4xl text-slate-900">{t('faq.title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                        {t.raw('faq.items').map((item: any, idx: number) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-100/50 flex flex-col gap-4 group hover:bg-white transition-all cursor-default"
                            >
                                <h4 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-primary transition-colors">
                                    {item.q}
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {item.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </motion.main>

            {/* Footer Section */}
            <footer className="bg-slate-900 text-white rounded-t-[3rem] mt-20">
                <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={32} className="text-rose-500 fill-rose-500" />
                        </div>
                        <h2 className="font-cinzel text-4xl tracking-widest uppercase">M & D</h2>
                        <p className="text-slate-400 font-light tracking-widest">{t('date')}</p>
                    </motion.div>

                    <p className="text-xl md:text-2xl font-light tracking-wide text-slate-200 italic max-w-2xl mx-auto">
                        "{t('footer.text')}"
                    </p>

                    <div className="pt-8 border-t border-white/10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Mail size={16} />
                                <a href="mailto:boda@maria-digvijay.com" className="hover:text-white transition-colors">
                                    {t('footer.email')}
                                </a>
                            </div>
                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-8">
                                &copy; 2026 María & Digvijay. Made with ❤️
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
