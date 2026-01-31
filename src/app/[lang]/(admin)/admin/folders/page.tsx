'use client';

import { useState, useEffect } from 'react';
import { getMoments, saveMoment, deleteMoment, type Moment } from '@/lib/actions/admin-folders';
import { Plus, Trash2, Edit2, Save, X, Loader2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_COLLECTIONS = [
    { name: 'Rituales', path: '/RitualIcons', prefix: 'Ritual_' },
    { name: 'Gallery', path: '/GalleryIcons', prefix: 'Icono_' },
    { name: 'Participate', path: '/ParticipateIcons', prefix: 'Icono_' },
    { name: 'Generic', path: '/GenericIcons', prefix: 'Icono_' },
];

// List of hardcoded filenames for now since we don't have a server-side dir lister here
// In a real app we'd fetch these from an API or build-time constant
const AVAILABLE_ICONS = [
    '/RitualIcons/Ritual_Ganesha.png',
    '/RitualIcons/Ritual_Mehndi.png',
    '/RitualIcons/Ritual_Haldi.png',
    '/RitualIcons/Ritual_Sangeet.png',
    '/RitualIcons/Ritual_Baraat.png',
    '/RitualIcons/Ritual_SaatPhere.png',
    '/GalleryIcons/Icono_Banquete.png',
    '/GalleryIcons/Icono_Ceremonia.png',
    '/GalleryIcons/Icono_Fiesta.png',
    '/GalleryIcons/Icono_Otros.png',
    '/GalleryIcons/Icono_PrebodaIndia.png',
    '/GalleryIcons/Icono_Recepción.png',
    '/ParticipateIcons/Icono_Juegos.png',
    '/ParticipateIcons/Icono_Muro.png',
    '/ParticipateIcons/Icono_Testimonios.png',
    '/GenericIcons/Icono_Brunch.png',
    '/GenericIcons/Icono_Cena.png',
    '/GenericIcons/Icono_Coche.png',
    '/GenericIcons/Icono_Copas.png',
    '/GenericIcons/Icono_Hotel.png',
    '/GenericIcons/Icono_Maleta.png',
    '/GenericIcons/Icono_Ubicacion.png',
    '/GenericIcons/Icono_Vuelo.png',
];

export default function AdminFoldersPage() {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Moment>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [showIconSelector, setShowIconSelector] = useState(false);

    useEffect(() => {
        loadMoments();
    }, []);

    const loadMoments = async () => {
        setLoading(true);
        const data = await getMoments();
        setMoments(data);
        setLoading(false);
    };

    const handleEdit = (moment: Moment) => {
        setEditingId(moment.id);
        setEditForm(moment);
    };

    const handleSave = async () => {
        if (!editForm.name) return;

        const result = await saveMoment(editForm as any);
        if (result.success) {
            setEditingId(null);
            setIsAdding(false);
            loadMoments();
        } else {
            alert('Error al guardar: ' + result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Borrar esta carpeta? Las fotos no se borrarán, quedarán sin carpeta.')) return;

        const result = await deleteMoment(id);
        if (result.success) {
            loadMoments();
        } else {
            alert('Error al borrar: ' + result.error);
        }
    };

    if (loading && moments.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-fredoka font-bold text-slate-900">Gestión de Carpetas</h2>
                    <p className="text-slate-600 mt-1">Define los "Momentos" de la boda para organizar la galería</p>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(true);
                        setEditForm({ name: '', icon: '📸', order: moments.length });
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    Nueva Carpeta
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(isAdding || editingId) && (
                    <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-orange-200 animate-in fade-in zoom-in duration-300 col-span-1 md:col-span-2 lg:col-span-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900">{isAdding ? 'Crear Carpeta' : 'Editar Carpeta'}</h3>
                            <button onClick={() => { setEditingId(null); setIsAdding(false); setShowIconSelector(false); }} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase block">Icono</label>
                                <div className="flex gap-2">
                                    <div
                                        onClick={() => setShowIconSelector(!showIconSelector)}
                                        className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden p-2"
                                    >
                                        {editForm.icon?.startsWith('/') ? (
                                            <img src={editForm.icon} alt="Selected" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-2xl">{editForm.icon || '📸'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <input
                                            type="text"
                                            value={editForm.icon}
                                            onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                                            placeholder="Emoji o Ruta"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                        />
                                        <button
                                            onClick={() => setShowIconSelector(!showIconSelector)}
                                            className="text-xs text-orange-600 font-bold hover:underline text-left pl-1"
                                        >
                                            {showIconSelector ? 'Cerrar selector' : 'Explorar galeria de iconos'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {showIconSelector && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-300 space-y-4">
                                    {ICON_COLLECTIONS.map(collection => (
                                        <div key={collection.name} className="space-y-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
                                                {collection.name === 'Rituales' ? 'Rituales Sagrados' : collection.name}
                                            </h4>
                                            <div className="grid grid-cols-4 gap-2">
                                                {AVAILABLE_ICONS.filter(path => path.startsWith(collection.path)).map(iconPath => (
                                                    <button
                                                        key={iconPath}
                                                        onClick={() => {
                                                            setEditForm({ ...editForm, icon: iconPath });
                                                            setShowIconSelector(false);
                                                        }}
                                                        className={cn(
                                                            "aspect-square bg-white rounded-lg p-1.5 border-2 transition-all hover:scale-105 active:scale-95",
                                                            editForm.icon === iconPath ? "border-orange-500" : "border-slate-100"
                                                        )}
                                                    >
                                                        <img src={iconPath} alt="Icon" className="w-full h-full object-contain" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
                                            Emojis & Otros
                                        </h4>
                                        <div className="grid grid-cols-6 gap-2">
                                            {['📸', '🎨', '✨', '💍', '💌', '🎉'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => {
                                                        setEditForm({ ...editForm, icon: emoji });
                                                        setShowIconSelector(false);
                                                    }}
                                                    className={cn(
                                                        "aspect-square bg-white rounded-lg flex items-center justify-center text-xl border-2 transition-all hover:scale-105 active:scale-95",
                                                        editForm.icon === emoji ? "border-orange-500" : "border-slate-100"
                                                    )}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Orden</label>
                                <input
                                    type="number"
                                    value={editForm.order}
                                    onChange={e => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
                                    className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                            >
                                <Save size={20} />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}

                {moments.map(moment => (
                    <div key={moment.id} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow relative group">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-2 shrink-0">
                            {moment.icon?.startsWith('/') ? (
                                <img src={moment.icon} alt={moment.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-3xl">{moment.icon}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-slate-900 truncate">{moment.name}</h3>
                            <p className="text-slate-500 text-sm italic truncate">/{moment.id}</p>
                            <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">Orden: {moment.order}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleEdit(moment)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(moment.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {moments.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <FolderOpen size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-medium font-outfit">No hay carpetas creadas todavía.</p>
                        <p className="text-slate-300 text-sm mt-1">Crea la primera para organizar tus fotos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
