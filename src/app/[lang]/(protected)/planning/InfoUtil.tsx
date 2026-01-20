'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CalendarClock, PhoneOutgoing, Activity, Car, Smartphone } from 'lucide-react';

const VACCINES = [
    { name: 'Hepatitis A', status: 'Imprescindible', desc: 'Agua/alimentos' },
    { name: 'Fiebre Tifoidea', status: 'Recomendada', desc: 'Oral o inyectable' },
    { name: 'Tétanos', status: 'Actualizar', desc: 'Cada 10 años' },
];

const TRANSPORTS = [
    { name: 'Uber', type: 'App Global', icon: <Smartphone size={18} /> },
    { name: 'Ola', type: 'App Local', icon: <Car size={18} /> },
    { name: 'Metro', type: 'Megalópolis', icon: <Activity size={18} /> },
];

export default function InfoUtil() {
    const handleSOS = () => {
        window.location.href = 'tel:+34911234567';
    };

    return (
        <div className="py-6 space-y-8">
            <header>
                <h2 className="text-3xl font-cinzel font-bold text-slate-900 mb-6">Logística de Viaje</h2>
            </header>

            {/* HeaderStatus Indicators */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex flex-col items-center text-center gap-2">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">Pasaporte</span>
                    <span className="text-[9px] text-emerald-700 font-medium"> {'>'}6 Meses</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex flex-col items-center text-center gap-2">
                    <CalendarClock className="text-amber-500" size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">Visado</span>
                    <span className="text-[9px] text-amber-700 font-medium">30 Días</span>
                </div>
                <button
                    onClick={handleSOS}
                    className="p-4 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200 flex flex-col items-center text-center gap-2 active:scale-95 transition-transform"
                >
                    <PhoneOutgoing size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Seguro</span>
                    <span className="text-[10px] font-bold">Botón SOS</span>
                </button>
            </div>

            {/* Transport Section */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-10 -mt-10" />
                <h3 className="text-xl font-cinzel font-bold mb-6 flex items-center gap-2">
                    <Car size={20} className="text-saffron" />
                    Transportes
                </h3>
                <div className="space-y-4">
                    {TRANSPORTS.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    {t.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{t.name}</h4>
                                    <p className="text-[10px] text-slate-400">{t.type}</p>
                                </div>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-saffron px-4 py-2 rounded-full border border-saffron/30">
                                Abrir
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vaccines Section */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-cinzel font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-teal" />
                    Salud y Vacunas
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {VACCINES.map((v, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-teal/5 border border-teal/10">
                            <div className="w-2 h-2 rounded-full bg-teal" />
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-slate-800">{v.name}</h4>
                                <p className="text-[10px] text-slate-500">{v.desc}</p>
                            </div>
                            <span className="text-[9px] font-bold px-3 py-1 bg-white rounded-full text-teal-700 shadow-sm border border-teal/10">
                                {v.status}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
