'use client';

import React from 'react';
import ProfileStats from '@/components/shared/ProfileStats';
import { useTranslations } from 'next-intl';

export default function MyDataPage() {
    return (
        <main className="min-h-screen bg-background-light px-6 pt-12 pb-40">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Mis Datos</h1>
                <p className="text-slate-500 text-sm">
                    Gestiona tus insignias, tokens y progreso dentro de la Wedding Experience.
                </p>
            </header>

            <ProfileStats />

            <footer className="mt-12 text-center">
                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                    Powered by Antigravity OS
                </p>
            </footer>
        </main>
    );
}
