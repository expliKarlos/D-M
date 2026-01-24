'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useChatStore } from '@/lib/store/chat-store';
import { MediaCarousel } from './MediaCarousel';

type Message = {
    role: 'user' | 'model';
    content: string;
    mediaUrls?: string[];
};

export function ChatInterface() {
    const { isOpen, close, pendingMessage, setPendingMessage } = useChatStore();

    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: '¡Hola! Soy el asistente de la boda. ¿En qué puedo ayudarte? (Horarios, transporte, vestimenta...)' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMsg = content.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.map(m => ({ role: m.role, parts: m.content }))
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.details || `Server Error ${response.status}`);
            }

            const mediaHeader = response.headers.get('X-Chat-Media-Urls');
            const mediaUrls = mediaHeader ? JSON.parse(mediaHeader) : [];

            setMessages(prev => [...prev, { role: 'model', content: '', mediaUrls }]);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });

                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    const updated = { ...last, content: last.content + text };
                    return [...prev.slice(0, -1), updated];
                });
            }

        } catch (error) {
            console.error('Chat error:', error);
            const errMsg = error instanceof Error ? error.message : 'Error desconocido';
            setMessages(prev => [...prev, { role: 'model', content: `⚠️ Error Técnico: ${errMsg}\n\nPor favor envía una captura de este mensaje.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg = input;
        setInput('');
        sendMessage(msg);
    };

    // Auto-trigger for pending messages
    useEffect(() => {
        if (isOpen && pendingMessage) {
            const msg = pendingMessage;
            setPendingMessage(null); // Clear immediately to avoid loops
            setTimeout(() => sendMessage(msg), 500); // Small delay for UX
        }
    }, [isOpen, pendingMessage, setPendingMessage]);

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-white flex flex-col pb-[130px]">
                    {/* Header */}
                    <div className="bg-[#FF9933] p-4 text-white flex justify-between items-center shrink-0 shadow-lg">
                        <div className="flex items-center gap-2">
                            <span className="material-icons-outlined">smart_toy</span>
                            <div>
                                <h3 className="font-bold">D&M Concierge</h3>
                                <p className="text-xs text-orange-100">Asistente Virtual IA</p>
                            </div>
                        </div>
                        <button onClick={close} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <span className="material-icons-outlined">close</span>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-orange-200">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#FF9933] text-white rounded-tr-none'
                                    : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-none'
                                    }`}>
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className="min-h-[1rem]">{line}</p>
                                    ))}
                                </div>

                                {msg.role === 'model' && msg.mediaUrls && msg.mediaUrls.length > 0 && (
                                    <div className="w-[85%] mt-2">
                                        <MediaCarousel mediaUrls={msg.mediaUrls} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs ml-2">
                                <div className="w-2 h-2 bg-[#FF9933]/60 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-[#FF9933]/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-2 h-2 bg-[#FF9933]/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 shrink-0">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregunta sobre la boda..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-2 bg-[#FF9933] text-white rounded-full disabled:opacity-50 disabled:bg-slate-300 hover:bg-[#FF9933]/90 transition-colors shadow-sm"
                            >
                                <span className="material-icons-outlined text-lg">send</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
