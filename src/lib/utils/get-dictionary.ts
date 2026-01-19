import type { Locale } from '@/lib/config/i18n';

const dictionaries = {
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    hi: () => import('@/dictionaries/hi.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
