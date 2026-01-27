'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, UserCheck, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminWhitelistItem {
    email: string;
    created_at: string;
}

export default function AdminsManagementPage() {
    const [admins, setAdmins] = useState<AdminWhitelistItem[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const PRIMARY_ADMIN = 'jncrls@gmail.com';

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admin/admins');
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || isSaving) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail })
            });

            if (res.ok) {
                showFeedback('success', 'Administrador añadido correctamente');
                setNewEmail('');
                fetchAdmins();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Error al añadir');
            }
        } catch (error: any) {
            showFeedback('error', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveAdmin = async (email: string) => {
        if (!confirm(`¿Estás seguro de que deseas revocar el acceso de administrador a ${email}?`)) return;

        try {
            const res = await fetch(`/api/admin/admins?email=${email}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showFeedback('success', 'Acceso revocado');
                fetchAdmins();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Error al eliminar');
            }
        } catch (error: any) {
            showFeedback('error', error.message);
        }
    };

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-fredoka font-bold text-slate-800 tracking-tight">Gestión de Administradores</h2>
                        <p className="text-slate-500 text-sm">Controla quién puede acceder a las herramientas de gestión de la boda.</p>
                    </div>
                </div>
            </header>

            {/* Feedback Notifications */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm shadow-lg ${feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'
                            }`}
                    >
                        {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {feedback.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form Section */}
                <section className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-orange-500" />
                            Nuevo Admin
                        </h3>
                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email del Admin</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="ejemplo@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-2 italic px-1">
                                    * El usuario debe registrarse con este email para obtener los permisos.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving || !newEmail}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md active:scale-[0.98]'
                                    }`}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                Añadir a la Lista
                            </button>
                        </form>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-2">
                        <h4 className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1">
                            <Sparkles size={12} /> Seguridad Activa
                        </h4>
                        <p className="text-[11px] text-blue-600 leading-tight">
                            El sistema sincroniza roles automáticamente. Si añades un email que ya existe como invitado, se convertirá en administrador al instante.
                        </p>
                    </div>
                </section>

                {/* List Section */}
                <section className="md:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <UserCheck size={16} className="text-slate-400" />
                                Whitelist de Administradores
                            </h3>
                        </div>

                        {isLoading ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="animate-spin text-orange-500" size={32} />
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {admins.map((admin) => (
                                    <div key={admin.email} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`p-2 rounded-lg ${admin.email === PRIMARY_ADMIN ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <Shield size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-slate-800 text-sm truncate">{admin.email}</div>
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                                                    {admin.email === PRIMARY_ADMIN ? (
                                                        <span className="text-orange-500 uppercase tracking-wider">Administrador Principal • Permanente</span>
                                                    ) : (
                                                        <span>Agregado el {new Date(admin.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {admin.email !== PRIMARY_ADMIN && (
                                            <button
                                                onClick={() => handleRemoveAdmin(admin.email)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Revocar acceso"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {admins.length === 0 && (
                                    <div className="p-12 text-center">
                                        <p className="text-slate-400 text-sm italic">No hay administradores adicionales.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-[10px] text-slate-400 italic text-center px-4">
                        Por seguridad, no se permite eliminar al administrador principal desde ninguna interfaz.
                    </p>
                </section>
            </div>
        </div>
    );
}
