'use client';

import { useState, useEffect } from 'react';
import { Send, Bell, History, Clock, Loader2, CheckCircle2, AlertCircle, Sparkles, Calendar } from 'lucide-react';
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

interface ScheduledItem {
    id: string;
    payload: { title: string, body: string, data?: { url?: string } };
    scheduled_for: string;
    status: 'pending' | 'sent' | 'failed';
}

export default function NotificationsAdminPage() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [scheduledFor, setScheduledFor] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [scheduledList, setScheduledList] = useState<ScheduledItem[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);


    useEffect(() => {
        fetchSettings();
        fetchHistory();
        fetchScheduled();
    }, []);

    const fetchScheduled = async () => {
        try {
            const res = await fetch('/api/admin/push/schedule');
            if (res.ok) {
                const data = await res.json();
                setScheduledList(data);
            }
        } catch (error) {
            console.error('Error fetching scheduled:', error);
        }
    };

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
        try {
            const res = await fetch('/api/admin/push/history');
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
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

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body || !scheduledFor || isScheduling) return;

        setIsScheduling(true);
        try {
            const res = await fetch('/api/admin/push/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body, scheduled_for: scheduledFor, url: targetUrl })
            });

            if (res.ok) {
                showFeedback('success', '¡Notificación programada con éxito!');
                setTitle('');
                setBody('');
                setTargetUrl('');
                setScheduledFor('');
                fetchScheduled();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Error al programar');
            }
        } catch (error: any) {
            showFeedback('error', error.message);
        } finally {
            setIsScheduling(false);
        }
    };

    const deleteScheduled = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/push/schedule?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showFeedback('success', 'Programación eliminada');
                fetchScheduled();
            } else {
                throw new Error('Error al eliminar');
            }
        } catch (error: any) {
            showFeedback('error', error.message);
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
                body: JSON.stringify({ title, body, url: targetUrl })
            });

            const data = await res.json();
            if (res.ok) {
                showFeedback('success', `¡Enviado con éxito a ${data.recipients} dispositivos!`);
                setTitle('');
                setBody('');
                setTargetUrl('');
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
                {/* Panel de Creación de Mensaje */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-orange-500" />
                        Crear Nuevo Aviso
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Título del Aviso</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: ¡La ceremonia comienza!"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Cuerpo del Mensaje</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Escribe aquí el contenido de la notificación..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm min-h-[80px] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Enlace opcional (Ruta interna)</label>
                            <input
                                type="text"
                                value={targetUrl}
                                onChange={(e) => setTargetUrl(e.target.value)}
                                placeholder="Ej: /planning/agenda o /wedding/info"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={handleSendNow}
                                disabled={isSending || !title || !body}
                                className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSending ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md active:scale-[0.98]'
                                    }`}
                            >
                                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                Enviar Ahora
                            </button>
                            <div className="relative group">
                                <input
                                    type="datetime-local"
                                    value={scheduledFor}
                                    onChange={(e) => setScheduledFor(e.target.value)}
                                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-[10px] outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                />
                                <button
                                    onClick={handleSchedule}
                                    disabled={isScheduling || !title || !body || !scheduledFor}
                                    className={`mt-2 w-full py-2.5 rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-2 transition-all ${isScheduling ? 'bg-slate-50 text-slate-300' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 border-dashed'
                                        }`}
                                >
                                    <Clock size={14} />
                                    {isScheduling ? 'Programando...' : 'Programar Envío'}
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic text-center">
                            * Los mensajes se traducen automáticamente vía Gemini.
                        </p>
                    </div>
                </section>

                <div className="space-y-8">
                    {/* Panel de Automatización */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-purple-500" />
                            Automatización
                        </h3>

                        <div className="space-y-4">
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
                                    Envía avisos 30-45 min antes de cada evento oficial con <b>link directo a la agenda</b>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Próximos Programados */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" />
                            Próximos Envíos
                        </h3>
                        <div className="space-y-3">
                            {scheduledList.length > 0 ? scheduledList.map(item => (
                                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group">
                                    <div className="min-w-0 pr-4">
                                        <div className="font-bold text-slate-700 text-xs truncate">{item.payload.title}</div>
                                        <div className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(item.scheduled_for).toLocaleString('es-ES', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setTitle(item.payload.title);
                                                setBody(item.payload.body);
                                                setTargetUrl(item.payload.data?.url || '');
                                                // Optional: Scroll to top
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Editar (Carga los datos en el formulario)"
                                        >
                                            <Sparkles size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteScheduled(item.id)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Eliminar programación"
                                        >
                                            <AlertCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 italic text-center py-4">No hay envíos programados</p>
                            )}
                        </div>
                    </section>
                </div>
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
