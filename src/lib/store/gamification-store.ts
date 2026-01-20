import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GamificationState {
    loveTokens: number;
    badges: string[];
    readItems: string[]; // IDs of InfoCards or articles read
    hasClaimedInfoUtilBadge: boolean;

    addLoveTokens: (amount: number) => void;
    markAsRead: (id: string, totalItems: number) => boolean; // Returns true if it triggered a badge
    addBadge: (badgeId: string) => void;
}

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            loveTokens: 0,
            badges: [],
            readItems: [],
            hasClaimedInfoUtilBadge: false,

            addLoveTokens: (amount) => set((state) => ({
                loveTokens: state.loveTokens + amount
            })),

            addBadge: (badgeId) => set((state) => ({
                badges: state.badges.includes(badgeId) ? state.badges : [...state.badges, badgeId]
            })),

            markAsRead: (id, totalItems) => {
                const state = get();
                if (state.readItems.includes(id)) return false;

                const newReadItems = [...state.readItems, id];
                set({ readItems: newReadItems });

                // Check for 100% Info Util badge (simplified logic for now)
                // In a real app, we'd check if we've read all IDs belonging to the Info Util category
                if (!state.hasClaimedInfoUtilBadge && newReadItems.length >= totalItems) {
                    set({ hasClaimedInfoUtilBadge: true });
                    state.addLoveTokens(50);
                    state.addBadge('info-explorer'); // The 'Antigravity' badge
                    return true;
                }

                return false;
            },
        }),
        {
            name: 'dm-app-gamification', // local storage key
        }
    )
);
