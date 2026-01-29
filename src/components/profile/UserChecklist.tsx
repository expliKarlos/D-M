'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getChecklist, toggleChecklistItem, deleteChecklistItem, updateChecklistReminder, ChecklistItem } from '@/lib/actions/checklist-actions';
import { Check, Trash2, ListTodo, Loader2, Bell, BellOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { checkPushSubscription, requestPushSubscription } from '@/lib/utils/push-notifications-client';

export default function UserChecklist() {
    const t = useTranslations('Profile.checklist');
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingReminder, setEditingReminder] = useState<string | null>(null);
    const [isSavingReminder, setIsSavingReminder] = useState(false);

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
        setItems(prev => prev.map(item =>
            item.item_id === id ? { ...item, completed: !currentStatus } : item
        ));
        try {
            await toggleChecklistItem(id, !currentStatus);
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
            toast.success('Eliminado de la lista');
        } catch (error) {
            setItems(originalItems);
            toast.error('Error al eliminar');
        }
    };

    const handleReminderSave = async (itemId: string, days: number | null) => {
        setIsSavingReminder(true);
        try {
            // Contextual Notification Logic
            const permission = Notification.permission;
            let pushActive = await checkPushSubscription();

            if (days !== null) {
                if (permission === 'denied') {
                    toast.error(t('reminders.denied'), { duration: 5000 });
                } else if (permission === 'default' || !pushActive) {
                    try {
                        await requestPushSubscription();
                        pushActive = true;
                    } catch (pushErr: any) {
                        if (pushErr.message === 'PERMISSION_DENIED') {
                            toast.warning(t('reminders.saved_no_push'), { duration: 6000 });
                        } else {
                            toast.warning('Notificaciones no activadas, pero recordatorio guardado.');
                        }
                    }
                }
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
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-300" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-8 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <ListTodo size={24} />
                </div>
                <p className="text-slate-500 text-sm font-medium">{t('empty')}</p>
            </div>
        );
    }

    const pendingItems = items.filter(i => !i.completed);

    const reminderOptions = [
        { label: t('reminders.none'), value: null },
        { label: t('reminders.1d'), value: 1 },
        { label: t('reminders.1w'), value: 7 },
        { label: t('reminders.1m'), value: 30 },
        { label: t('reminders.3m'), value: 90 },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <ListTodo size={16} className="text-primary" />
                    {t('pending')} ({pendingItems.length})
                </h3>
            </div>

            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {items.sort((a, b) => Number(a.completed) - Number(b.completed)).map((item) => (
                        <motion.div
                            layout
                            key={item.item_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`
                                group relative flex flex-col gap-2 p-3 rounded-xl border transition-all
                                ${item.completed
                                    ? 'bg-slate-50 border-slate-100 opacity-60'
                                    : 'bg-white border-slate-100 shadow-sm'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggle(item.item_id, item.completed)}
                                    className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                                        ${item.completed
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-slate-300 hover:border-primary text-transparent'
                                        }
                                    `}
                                >
                                    <Check size={14} strokeWidth={3} />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${item.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                        {item.item_title}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                                            {item.category}
                                        </span>
                                        {item.reminder_days ? (
                                            <span className="flex items-center gap-1 text-[9px] text-[#FF9933] font-bold bg-orange-50 px-1.5 py-0.5 rounded-md">
                                                <Bell size={8} />
                                                {reminderOptions.find(o => o.value === item.reminder_days)?.label}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                {!item.completed && (
                                    <button
                                        onClick={() => setEditingReminder(editingReminder === item.item_id ? null : item.item_id)}
                                        className={`p-2 rounded-xl transition-all ${item.reminder_days ? 'text-[#FF9933] bg-orange-50' : 'text-slate-300 hover:text-primary hover:bg-slate-50'}`}
                                    >
                                        <BellOff size={16} />
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(item.item_id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Reminder Settings Panel */}
                            <AnimatePresence>
                                {editingReminder === item.item_id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-slate-50 mt-1 pt-2"
                                    >
                                        <div className="flex flex-wrap gap-2 py-1">
                                            {reminderOptions.map((opt) => (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => handleReminderSave(item.item_id, opt.value)}
                                                    disabled={isSavingReminder}
                                                    className={`
                                                        px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
                                                        ${item.reminder_days === opt.value
                                                            ? 'bg-primary text-white shadow-sm'
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        }
                                                        ${isSavingReminder ? 'opacity-50 pointer-events-none' : ''}
                                                    `}
                                                >
                                                    {isSavingReminder && item.reminder_days === opt.value ? (
                                                        <Loader2 size={10} className="animate-spin" />
                                                    ) : opt.label}
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
    );
}
