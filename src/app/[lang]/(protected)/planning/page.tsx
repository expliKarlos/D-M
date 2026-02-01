'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface MenuCard {
    id: string;
    title: string;
    iconPath: string;
    href: string;
}

function PlanningContent() {
    const router = useRouter();
    const params = useParams();

    const menuItems: MenuCard[] = [
        {
            id: 'india',
            title: 'Info India',
            iconPath: '/PlanningIcons/Icono_Menu_India.png',
            href: `/${params.lang}/planning/india`
        },
        {
            id: 'spain',
            title: 'Info España',
            iconPath: '/PlanningIcons/Icono_Menu_España.png',
            href: `/${params.lang}/planning/spain`
        },
        {
            id: 'agenda',
            title: 'Agenda',
            iconPath: '/PlanningIcons/Icono_Menu_Agenda.png',
            href: `/${params.lang}/planning/agenda`
        },
        {
            id: 'datos',
            title: 'Mis Datos',
            iconPath: '/PlanningIcons/Icono_Menu_Datos.png',
            href: `/${params.lang}/profile`
        }
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] pt-24 pb-40 px-6 max-w-2xl mx-auto">
            <div className="text-center mb-12 space-y-4">
                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-5xl font-cinzel font-bold text-slate-900 leading-tight"
                >
                    Planifica tu <span className="text-saffron-metallic">Viaje</span>
                </motion.h1>
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2 }}
                    className="h-px w-24 bg-gradient-to-r from-transparent via-saffron/30 to-transparent mx-auto"
                />
            </div>

            <div className="grid grid-cols-1 gap-5">
                {menuItems.map((item, index) => (
                    <motion.button
                        key={item.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        onClick={() => router.push(item.href)}
                        className="group relative flex items-center gap-6 p-5 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-saffron/20 transition-all text-left overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-slate-50 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out -z-10 opacity-50" />

                        {/* Icon Container */}
                        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                            <div className="absolute inset-0 bg-slate-50 rounded-full scale-90 group-hover:scale-100 transition-transform" />
                            <Image
                                src={item.iconPath}
                                alt={item.title}
                                fill
                                className="object-contain p-2"
                            />
                        </div>

                        {/* Text Content */}
                        <div className="flex-grow">
                            <h3 className="text-xl md:text-2xl font-cinzel font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-outfit uppercase tracking-widest font-bold">
                                <span>Explorar</span>
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Subtle Glow */}
                        <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-saffron group-hover:w-full transition-all duration-500" />
                    </motion.button>
                ))}
            </div>

            {/* Decorative bottom element */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="mt-16 flex justify-center opacity-30 pointer-events-none"
            >
                <Image
                    src="/elements/mandala-decorative.png"
                    alt="Decoración"
                    width={120}
                    height={120}
                    className="animate-spin-slow"
                />
            </motion.div>
        </main>
    );
}

export default function PlanningPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-cinzel text-slate-300">Cargando...</div>}>
            <PlanningContent />
        </Suspense>
    );
}
