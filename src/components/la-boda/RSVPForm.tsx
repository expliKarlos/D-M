'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, XCircle } from 'lucide-react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function RSVPForm() {
    const t = useTranslations('LaBoda.rsvp_form');

    const [formData, setFormData] = useState({
        name: '',
        attending: true,
        dietary_restrictions: '',
        comments: '',
        country_code: '+34',
        phone: ''
    });

    const [status, setStatus] = useState<FormStatus>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    setFormData({
                        name: '',
                        attending: true,
                        dietary_restrictions: '',
                        comments: '',
                        country_code: '+34',
                        phone: ''
                    });
                    setStatus('idle');
                }, 3000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch (error) {
            console.error('RSVP Submit Error:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm"
        >
            <div className="text-center mb-8">
                <h2 className="font-cinzel text-3xl md:text-4xl text-slate-900 mb-3 tracking-tight">
                    {t('title')}
                </h2>
                <p className="text-slate-500 font-light tracking-wide">
                    {t('subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {t('fields.name.label')}
                    </label>
                    <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('fields.name.placeholder')}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-300 focus:ring focus:ring-rose-100 outline-none transition-all bg-white/50 text-slate-800 font-outfit"
                        disabled={status === 'submitting' || status === 'success'}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {t('fields.attending.label')}
                    </label>
                    <div className="flex gap-4">
                        <label className="flex-1 relative cursor-pointer">
                            <input
                                type="radio"
                                name="attending"
                                checked={formData.attending === true}
                                onChange={() => setFormData({ ...formData, attending: true })}
                                className="peer sr-only"
                                disabled={status === 'submitting' || status === 'success'}
                            />
                            <div className="px-6 py-3 rounded-2xl border-2 border-slate-200 text-center transition-all peer-checked:border-rose-500 peer-checked:bg-rose-50 peer-checked:text-rose-700 font-medium text-slate-600 hover:border-slate-300">
                                {t('fields.attending.yes')}
                            </div>
                        </label>

                        <label className="flex-1 relative cursor-pointer">
                            <input
                                type="radio"
                                name="attending"
                                checked={formData.attending === false}
                                onChange={() => setFormData({ ...formData, attending: false })}
                                className="peer sr-only"
                                disabled={status === 'submitting' || status === 'success'}
                            />
                            <div className="px-6 py-3 rounded-2xl border-2 border-slate-200 text-center transition-all peer-checked:border-slate-500 peer-checked:bg-slate-50 peer-checked:text-slate-700 font-medium text-slate-600 hover:border-slate-300">
                                {t('fields.attending.no')}
                            </div>
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="dietary" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {t('fields.dietary.label')}
                    </label>
                    <input
                        type="text"
                        id="dietary"
                        value={formData.dietary_restrictions}
                        onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                        placeholder={t('fields.dietary.placeholder')}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-300 focus:ring focus:ring-rose-100 outline-none transition-all bg-white/50 text-slate-800 font-outfit"
                        disabled={status === 'submitting' || status === 'success'}
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {t('fields.message.label')}
                    </label>
                    <textarea
                        id="message"
                        rows={4}
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder={t('fields.message.placeholder')}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-300 focus:ring focus:ring-rose-100 outline-none transition-all bg-white/50 text-slate-800 font-outfit resize-none"
                        disabled={status === 'submitting' || status === 'success'}
                    />
                </div>

                {/* Phone Number */}
                <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {t('fields.phone.label')}
                    </label>
                    <div className="flex gap-3">
                        <select
                            value={formData.country_code}
                            onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                            className="px-3 py-3 rounded-2xl border border-slate-200 focus:border-rose-300 focus:ring focus:ring-rose-100 outline-none transition-all bg-white/50 text-slate-800 font-outfit w-24"
                            disabled={status === 'submitting' || status === 'success'}
                        >
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+39">🇮🇹 +39</option>
                            <option value="+52">🇲🇽 +52</option>
                        </select>
                        <input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={t('fields.phone.placeholder')}
                            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-300 focus:ring focus:ring-rose-100 outline-none transition-all bg-white/50 text-slate-800 font-outfit"
                            disabled={status === 'submitting' || status === 'success'}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={status === 'submitting' || status === 'success'}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
                >
                    {status === 'submitting' ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <Send size={18} />
                            </motion.div>
                            {t('button.sending')}
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            {t('button.submit')}
                        </>
                    )}
                </button>

                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-700"
                        >
                            <CheckCircle size={20} className="shrink-0" />
                            <p className="font-medium">{t('feedback.success')}</p>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700"
                        >
                            <XCircle size={20} className="shrink-0" />
                            <p className="font-medium">{t('feedback.error')}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
}
