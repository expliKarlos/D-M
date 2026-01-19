import { getRequestConfig } from 'next-intl/server';
import { i18n } from '@/lib/config/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically comes from the middleware, but we provide a fallback
    let locale = await requestLocale;

    // Ensure that incoming locale is valid
    if (!locale || !i18n.locales.includes(locale as any)) {
        locale = i18n.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
