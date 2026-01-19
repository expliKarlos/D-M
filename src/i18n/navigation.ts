import { createNavigation } from 'next-intl/navigation';
import { i18n } from '@/lib/config/i18n';

export const { Link, redirect, usePathname, useRouter } =
    createNavigation({ locales: i18n.locales, localePrefix: 'always' });
