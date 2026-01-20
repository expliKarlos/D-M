'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Hand, Footprints, Wind, Sparkles } from 'lucide-react';

const PROTOCOLS = [
    {
        title: 'La Mano Derecha',
        hindi: 'दायां हाथ',
        desc: 'Usa siempre la mano derecha para comer, dar dinero o saludar. La izquierda se considera impura.',
        icon: <Hand className="text-saffron" size={24} />,
        color: 'border-saffron/20 bg-saffron/5'
    },
    {
        title: 'Calzado Fuera',
        hindi: 'जूते उतारें',
        desc: 'Quítate los zapatos antes de entrar en hogares, templos e incluso algunas tiendas. Sandalias cómodas son clave.',
        icon: <Footprints className="text-teal" size={24} />,
        color: 'border-teal/20 bg-teal/5'
    },
    {
        title: 'Actitud Shanti',
        hindi: 'शांति',
        desc: 'Paciencia infinita. El caos no es un error, es parte de la experiencia. Fluye con él, no luches.',
        icon: <Wind className="text-primary" size={24} />,
        color: 'border-primary/20 bg-primary/5'
    },
    {
        title: 'Vestimenta Social',
        hindi: 'वेशभूषा',
        desc: 'Cubre hombros y rodillas en lugares sagrados. Un pañuelo (foulard) es tu mejor aliado.',
        icon: <Sparkles className="text-amber-500" size={24} />,
        color: 'border-amber-500/20 bg-amber-500/5'
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function InfoIndia() {
    return (
        <div className="py-6">
            <header className="mb-8">
                <h2 className="text-3xl font-cinzel font-bold text-slate-900 mb-2">Respeto & Cultura</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Pequeños gestos que abren grandes puertas. La etiqueta social en India es un arte de respeto.
                </p>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                {PROTOCOLS.map((p, i) => (
                    <motion.div
                        key={i}
                        variants={item}
                        className={`p-6 rounded-3xl border ${p.color} backdrop-blur-sm flex flex-col gap-4 hover:shadow-lg transition-all duration-300 group`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                                {p.icon}
                            </div>
                            <span className="text-[10px] font-hindi text-slate-400 uppercase tracking-widest">{p.hindi}</span>
                        </div>

                        <div>
                            <h3 className="font-cinzel font-bold text-slate-800 mb-1">{p.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {p.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
