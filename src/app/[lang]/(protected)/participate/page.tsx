'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function ParticipateHubPage() {
    const t = useTranslations('Participation.page');

    const HUB_BUTTONS = [
        {
            id: 'wall',
            title: t('tabs.muro'),
            icon: '/ParticipateIcons/Icono_Muro.png',
            href: '/participate/wall',
            color: 'from-orange-50 to-orange-100/30'
        },
        {
            id: 'gallery',
            title: t('tabs.galeria'),
            icon: '/ParticipateIcons/Icono_Testimonios.png',
            href: '/participate/gallery',
            color: 'from-fuchsia-50 to-fuchsia-100/30'
        },
        {
            id: 'games',
            title: t('tabs.juegos'),
            icon: '/ParticipateIcons/Icono_Juegos.png',
            href: '/participate/games',
            color: 'from-blue-50 to-blue-100/30'
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="min-h-screen bg-[#FFFCF9] pb-32">
            {/* Header */}
            <header className="pt-20 pb-12 px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-cinzel text-3xl md:text-4xl text-slate-900 tracking-tight leading-tight"
                >
                    {t('page_title')}
                </motion.h1>
                <div className="w-12 h-1 bg-primary/20 mx-auto mt-6 rounded-full" />
            </header>

            <main className="max-w-xl mx-auto px-6">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    {HUB_BUTTONS.map((btn) => (
                        <motion.div key={btn.id} variants={item}>
                            <Link href={btn.href}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative group flex items-center p-6 rounded-[2.5rem] bg-gradient-to-r ${btn.color} border border-white shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden`}
                                >
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Watercolor Icon */}
                                    <div className="relative w-20 h-20 flex-shrink-0">
                                        <Image
                                            src={btn.icon}
                                            alt={btn.title}
                                            fill
                                            className="object-contain drop-shadow-sm group-hover:rotate-12 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Text Content */}
                                    <div className="ml-6 flex-grow">
                                        <h3 className="font-fredoka text-2xl text-slate-800 group-hover:text-primary transition-colors">
                                            {btn.title}
                                        </h3>
                                        <div className="w-8 h-0.5 bg-primary/10 mt-2 rounded-full group-hover:w-16 transition-all duration-500" />
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex-shrink-0 bg-white/80 p-3 rounded-2xl shadow-sm border border-slate-50 opacity-40 group-hover:opacity-100 transition-all">
                                        <ChevronRight className="text-primary" size={20} />
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
}
