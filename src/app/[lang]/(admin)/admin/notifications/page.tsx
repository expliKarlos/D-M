'use client';

import { useState, useEffect } from 'react';
import { Send, Bell, History, Clock, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/services/supabase';

interface HistoryItem {
    id: string;
    title: string;
    body: string;
    recipients_count: number;
    type: 'manual' | 'automation';
    created_at: string;
}

export default function NotificationsAdminPage() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);


    useEffect(() => {
        fetchSettings();
        fetchHistory();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/push/settings');
            const data = await res.json();
            setIsAutomationEnabled(data.enabled);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoadingSettings(false);
        }
    };

    const fetchHistory = async () => {
        const { data, error } = await supabase
            .from('notification_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error && data) setHistory(data);
    };

    const toggleAutomation = async () => {
        const newValue = !isAutomationEnabled;
        setIsAutomationEnabled(newValue);
        try {
            const res = await fetch('/api/admin/push/settings', {
                method: 'POST',
                body: JSON.stringify({ enabled: newValue })
            });
            if (!res.ok) throw new Error();
            showFeedback('success', `Automatización ${newValue ? 'activada' : 'desactivada'}`);
        } catch (error) {
            setIsAutomationEnabled(!newValue);
            showFeedback('error', 'Error al actualizar configuración');
        }
    };

    const handleSendNow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body || isSending) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/admin/push/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body })
            });

            const data = await res.json();
            if (res.ok) {
                showFeedback('success', `¡Enviado con éxito a ${data.recipients} dispositivos!`);
                setTitle('');
                setBody('');
                fetchHistory();
            } else {
                throw new Error(data.error || 'Error al enviar');
            }
        } catch (error: any) {
            showFeedback('error', error.message);
        } finally {
            setIsSending(false);
        }
    };

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 5000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="text-orange-500" />
                        Centro de Notificaciones
                    </h2>
                    <p className="text-slate-500 text-sm">Gestiona los avisos push y la automatización de la agenda</p>
                </div>
            </header>

            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                    >
                        {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="font-medium">{feedback.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Panel de Envío Manual */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Send size={18} className="text-blue-500" />
                        Envío Manual
                    </h3>
                    <form onSubmit={handleSendNow} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Título del Aviso</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: ¡La ceremonia comienza!"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Cuerpo del Mensaje</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Escribe aquí el contenido de la notificación..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm min-h-[100px] outline-none"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 italic">
                            * Se traducirá automáticamente al Inglés e Hindi usando IA.
                        </p>
                        <button
                            type="submit"
                            disabled={isSending || !title || !body}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSending ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md active:scale-[0.98]'
                                }`}
                        >
                            {isSending ? (
                                <><Loader2 className="animate-spin" size={20} /> Enviando...</>
                            ) : (
                                <><Send size={18} /> Enviar Ahora</>
                            )}
                        </button>
                    </form>
                </section>

                {/* Panel de Automatización */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-purple-500" />
                        Automatización
                    </h3>

                    <div className="flex-1 space-y-6">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-700">Recordatorios de Agenda</span>
                                <button
                                    onClick={toggleAutomation}
                                    disabled={isLoadingSettings}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAutomationEnabled ? 'bg-green-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAutomationEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Envía avisos automáticos 30 minutos antes de cada evento oficial de la agenda.
                            </p>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 border-dashed">
                            <h4 className="text-[11px] font-bold text-orange-700 uppercase mb-2 flex items-center gap-1">
                                <Sparkles size={12} /> Próximo Paso
                            </h4>
                            <p className="text-[11px] text-orange-600">
                                Configura el Cron Job en Vercel apuntando a:
                                <code className="block mt-1 bg-white/50 p-1 rounded font-mono break-all text-[10px]">
                                    /api/cron/push-agenda
                                </code>
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Historial */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <History size={18} className="text-slate-400" />
                        Historial de Envíos
                    </h3>
                    <button onClick={fetchHistory} className="text-xs font-bold text-orange-500 hover:text-orange-600">
                        Actualizar
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Mensaje</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Alcance</th>
                                <th className="px-6 py-4">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.length > 0 ? history.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-700 text-sm">{item.title}</div>
                                        <div className="text-xs text-slate-400 line-clamp-1">{item.body}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${item.type === 'automation' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-600 text-sm">
                                            <Bell size={14} className="text-slate-300" />
                                            {item.recipients_count}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {new Date(item.created_at).toLocaleString('es-ES', {
                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No hay registros en el historial todavía.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
