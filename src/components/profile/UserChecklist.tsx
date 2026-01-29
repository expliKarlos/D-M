'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getChecklist, toggleChecklistItem, deleteChecklistItem, updateChecklistReminder, ChecklistItem } from '@/lib/actions/checklist-actions';
import { Check, Trash2, ListTodo, Loader2, Bell, BellOff, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { checkPushSubscription, requestPushSubscription } from '@/lib/utils/push-notifications-client';

export default function UserChecklist() {
    const t = useTranslations('Profile.checklist');
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingReminder, setEditingReminder] = useState<string | null>(null);
    const [isSavingReminder, setIsSavingReminder] = useState(false);
    const [showFinished, setShowFinished] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await getChecklist();
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setItems(prev => prev.map(item =>
            item.item_id === id ? { ...item, completed: !currentStatus } : item
        ));

        try {
            await toggleChecklistItem(id, !currentStatus);
            if (!currentStatus) {
                // Just completed
                toast.success('¡Tarea completada!', {
                    icon: '✅',
                });
            }
        } catch (error) {
            setItems(prev => prev.map(item =>
                item.item_id === id ? { ...item, completed: currentStatus } : item
            ));
            toast.error('Error al actualizar');
        }
    };

    const handleDelete = async (id: string) => {
        const originalItems = [...items];
        setItems(prev => prev.filter(item => item.item_id !== id));
        try {
            await deleteChecklistItem(id);
            toast.success('Eliminado de tus tareas');
        } catch (error) {
            setItems(originalItems);
            toast.error('Error al eliminar');
        }
    };

    const handleReminderSave = async (itemId: string, days: number | null) => {
        setIsSavingReminder(true);
        try {
            const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
            let pushActive = await checkPushSubscription();

            if (days !== null && (permission !== 'granted' || !pushActive)) {
                // Friendly flow triggered when choosing a reminder without subscription
                toast.info('Activa las notificaciones para recibir este aviso', {
                    action: {
                        label: 'Activar',
                        onClick: async () => {
                            try {
                                await requestPushSubscription();
                                await updateChecklistReminder(itemId, days);
                                setItems(prev => prev.map(item =>
                                    item.item_id === itemId ? { ...item, reminder_days: days } : item
                                ));
                                toast.success('¡Listo! Te avisaremos.');
                            } catch (e) {
                                toast.error('No se pudieron activar las notificaciones');
                            }
                        }
                    },
                    duration: 10000
                });
                setEditingReminder(null);
                return;
            }

            await updateChecklistReminder(itemId, days);
            setItems(prev => prev.map(item =>
                item.item_id === itemId ? { ...item, reminder_days: days } : item
            ));

            if (days !== null) {
                toast.success(t('reminders.success'));
            }
            setEditingReminder(null);
        } catch (error) {
            toast.error('Error al guardar recordatorio');
        } finally {
            setIsSavingReminder(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-orange-400 w-8 h-8 opacity-20" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-10 px-4">
                <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-slate-200 shadow-inner border border-slate-100">
                    <ListTodo size={32} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('no_tasks')}</p>
            </div>
        );
    }

    const pendingItems = items.filter(i => !i.completed);
    const finishedItems = items.filter(i => i.completed);

    const reminderOptions = [
        { label: t('reminders.none'), value: null },
        { label: t('reminders.1d'), value: 1 },
        { label: t('reminders.1w'), value: 7 },
        { label: t('reminders.1m'), value: 30 },
    ];

    return (
        <div className="space-y-8">
            {/* Pending Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        {t('pending')} ({pendingItems.length})
                    </h4>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {pendingItems.map((item) => (
                            <motion.div
                                layout
                                key={item.item_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => handleToggle(item.item_id, item.completed)}
                                        className="mt-1 w-7 h-7 rounded-full border-2 border-slate-100 flex items-center justify-center transition-all bg-white hover:border-orange-200 text-slate-100 hover:text-orange-500 shadow-sm shrink-0"
                                    >
                                        <Check size={16} strokeWidth={4} />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">
                                                {item.category}
                                            </span>
                                            {item.reminder_days ? (
                                                <span className="flex items-center gap-1 text-[8px] text-blue-500 font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                                                    <Bell size={8} />
                                                    Recordatorio
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">
                                            {item.item_title}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setEditingReminder(editingReminder === item.item_id ? null : item.item_id)}
                                            className={`p-2.5 rounded-2xl transition-all ${item.reminder_days ? 'text-blue-500 bg-blue-50' : 'text-slate-300 hover:bg-slate-50'}`}
                                        >
                                            <Bell size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.item_id)}
                                            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Inline Reminder Selector */}
                                <AnimatePresence>
                                    {editingReminder === item.item_id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-slate-50 rounded-2xl mt-4 px-3 py-2"
                                        >
                                            <div className="flex flex-wrap gap-2 py-1 justify-center">
                                                {reminderOptions.map((opt) => (
                                                    <button
                                                        key={opt.label}
                                                        onClick={() => handleReminderSave(item.item_id, opt.value)}
                                                        disabled={isSavingReminder}
                                                        className={`
                                                            px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                                                            ${item.reminder_days === opt.value
                                                                ? 'bg-slate-900 text-white shadow-lg'
                                                                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                                                            }
                                                            ${isSavingReminder ? 'opacity-50 pointer-events-none' : ''}
                                                        `}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Finished Section */}
            {finishedItems.length > 0 && (
                <div className="pt-4 border-t border-slate-50">
                    <button
                        onClick={() => setShowFinished(!showFinished)}
                        className="w-full flex items-center justify-between px-2 py-2 text-slate-300 hover:text-slate-400 transition-colors"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Check size={12} strokeWidth={3} className="text-green-500" />
                            {t('finished')} ({finishedItems.length})
                        </h4>
                        {showFinished ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <AnimatePresence>
                        {showFinished && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-2 mt-4 overflow-hidden"
                            >
                                {finishedItems.map((item) => (
                                    <div
                                        key={item.item_id}
                                        className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-50 opacity-60 grayscale"
                                    >
                                        <button
                                            onClick={() => handleToggle(item.item_id, item.completed)}
                                            className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm shrink-0"
                                        >
                                            <Check size={14} strokeWidth={4} />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-500 line-through truncate">
                                                {item.item_title}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.item_id)}
                                            className="p-2 text-slate-300 hover:text-rose-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
