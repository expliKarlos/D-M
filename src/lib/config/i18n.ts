export const locales = ['es', 'en', 'hi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const i18n = {
    defaultLocale,
    locales,
} as const;
