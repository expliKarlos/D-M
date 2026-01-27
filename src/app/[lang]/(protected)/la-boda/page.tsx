'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
    MapPin,
    Calendar,
    Clock,
    Car,
    Hotel,
    HelpCircle,
    ExternalLink,
    ChefHat,
    Music,
    Heart
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function LaBodaPage() {
    const t = useTranslations('LaBoda');

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
        { key: 'arrival', icon: <Clock className="text-orange-400" /> },
        { key: 'ceremony', icon: <Heart className="text-rose-500" /> },
        { key: 'cocktail', icon: <ChefHat className="text-amber-500" /> },
        { key: 'banquet', icon: <ChefHat className="text-orange-600" /> },
        { key: 'party', icon: <Music className="text-purple-500" /> },
    ];

    return (
        <div className="min-h-screen bg-[#FAF9F6] pb-24 font-outfit text-slate-800">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/header-fusion.png"
                    alt="Wedding Header"
                    fill
                    className="object-cover opacity-30 scale-110 blur-[2px]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAF9F6]/50 to-[#FAF9F6]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative text-center px-6"
                >
                    <span className="block text-sm uppercase tracking-[0.3em] text-slate-500 mb-4 font-light">
                        {t('date')}
                    </span>
                    <h1 className="font-cinzel text-5xl md:text-7xl text-slate-900 mb-4 tracking-tight">
                        {t('subtitle')}
                    </h1>
                    <div className="w-16 h-[1px] bg-primary/30 mx-auto" />
                </motion.div>
            </section>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="max-w-4xl mx-auto px-6 space-y-24"
            >
                {/* Localization & Info */}
                <section className="text-center space-y-8">
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h2 className="font-cinzel text-3xl text-slate-900">{t('location.title')}</h2>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                                <MapPin size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{t('location.name')}</h3>
                                <p className="text-slate-500">{t('location.address')}</p>
                            </div>
                            <a
                                href={t('location.maps_url')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform"
                            >
                                <span>Google Maps</span>
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* Schedule */}
                <section className="space-y-12">
                    <div className="text-center">
                        <h2 className="font-cinzel text-3xl text-slate-900 mb-2">{t('schedule.title')}</h2>
                        <p className="text-slate-500 italic">Viernes, 12 de Junio</p>
                    </div>

                    <div className="relative">
                        {/* Center Line */}
                        <div className="absolute left-[21px] md:left-1/2 top-0 bottom-0 w-[1px] bg-slate-200" />

                        <div className="space-y-12 relative">
                            {scheduleEvents.map((event, index) => (
                                <motion.div
                                    key={event.key}
                                    variants={itemVariants}
                                    className={`flex items-start md:items-center gap-6 md:gap-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    <div className="md:w-1/2 flex justify-end md:px-12">
                                        <div className={`hidden md:block ${index % 2 === 0 ? 'text-right' : 'text-left w-full'}`}>
                                            <span className="text-sm font-bold text-primary block mb-1">{t(`schedule.${event.key}.time`)}</span>
                                            <p className="text-slate-700">{t(`schedule.${event.key}.text`)}</p>
                                        </div>
                                    </div>

                                    {/* Dot/Icon */}
                                    <div className="z-10 w-11 h-11 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                        {event.icon}
                                    </div>

                                    <div className="md:w-1/2 flex justify-start md:px-12">
                                        <div className={`${index % 2 !== 0 ? 'md:text-right w-full' : 'text-left'}`}>
                                            <div className="md:hidden">
                                                <span className="text-xs font-bold text-primary block mb-1">{t(`schedule.${event.key}.time`)}</span>
                                                <p className="text-sm text-slate-700">{t(`schedule.${event.key}.text`)}</p>
                                            </div>
                                            <div className="hidden md:block">
                                                {index % 2 !== 0 ? (
                                                    <>
                                                        <span className="text-sm font-bold text-primary block mb-1">{t(`schedule.${event.key}.time`)}</span>
                                                        <p className="text-slate-700">{t(`schedule.${event.key}.text`)}</p>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Travel & Accommodation */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3 text-blue-500 mb-2">
                            <Hotel size={24} />
                            <h3 className="text-lg font-bold">{t('travel.title')}</h3>
                        </div>
                        <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                            <p><strong>Alojamiento:</strong> {t('travel.accommodation')}</p>
                            <p><strong>Cómo llegar:</strong> {t('travel.how_to_get')}</p>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3 text-orange-500 mb-2">
                            <Car size={24} />
                            <h3 className="text-lg font-bold">Logística</h3>
                        </div>
                        <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                            <p>{t('travel.transport')}</p>
                            <p className="italic text-xs">Ponte en contacto con nosotros si necesitas transporte especial.</p>
                        </div>
                    </motion.div>
                </section>

                {/* FAQ */}
                <section className="space-y-8">
                    <div className="text-center">
                        <h2 className="font-cinzel text-3xl text-slate-900 mb-2">{t('faq.title')}</h2>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { q: 'Dress Code', a: t('faq.dress_code'), icon: <HelpCircle className="text-slate-400" /> },
                            { q: 'Niños', a: t('faq.children'), icon: <HelpCircle className="text-slate-400" /> },
                            { q: 'Regalo', a: t('faq.gifts'), icon: <HelpCircle className="text-slate-400" /> },
                        ].map((faq, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-50 flex gap-4"
                            >
                                <div className="mt-1 shrink-0">{faq.icon}</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">{faq.q}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Footer style separator */}
                <footer className="pt-20 pb-10 text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
                            <Heart size={20} fill="currentColor" />
                        </div>
                        <p className="font-cinzel text-xl tracking-widest text-slate-400">M & D</p>
                    </motion.div>
                </footer>
            </motion.main>
        </div>
    );
}
