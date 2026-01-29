'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getChecklist, toggleChecklistItem, deleteChecklistItem, ChecklistItem } from '@/lib/actions/checklist-actions';
import { Check, Trash2, ListTodo, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function UserChecklist() {
    const t = useTranslations('Profile.checklist');
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        } catch (error) {
            // Revert on error
            setItems(prev => prev.map(item =>
                item.item_id === id ? { ...item, completed: currentStatus } : item
            ));
            toast.error('Error al actualizar');
        }
    };

    const handleDelete = async (id: string) => {
        // Optimistic update
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
    const completedItems = items.filter(i => i.completed);

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
                                group flex items-center gap-3 p-3 rounded-xl border transition-all
                                ${item.completed
                                    ? 'bg-slate-50 border-slate-100 opacity-60'
                                    : 'bg-white border-slate-100 shadow-sm'
                                }
                            `}
                        >
                            <button
                                onClick={() => handleToggle(item.item_id, item.completed)}
                                className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                    ${item.completed
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-slate-300 hover:border-primary text-transparent'
                                    }
                                `}
                            >
                                <Check size={14} strokeWidth={3} />
                            </button>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${item.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                    {item.item_title}
                                </p>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                    {item.category}
                                </span>
                            </div>

                            <button
                                onClick={() => handleDelete(item.item_id)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
