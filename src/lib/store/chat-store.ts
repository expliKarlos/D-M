
import { create } from 'zustand';

interface ChatStore {
    isOpen: boolean;
    pendingMessage: string | null;
    open: () => void;
    close: () => void;
    toggle: () => void;
    setPendingMessage: (message: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    isOpen: false,
    pendingMessage: null,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    setPendingMessage: (message: string | null) => set({ pendingMessage: message }),
}));
