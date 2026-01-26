import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/utils/supabase/middleware';
import { i18n } from '@/lib/config/i18n';

const nextIntlMiddleware = createMiddleware({
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
    localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
    // 1. Handle Supabase session and Auth
    const { response, user } = await updateSession(request);

    // 2. Route Protection
    const pathname = request.nextUrl.pathname;

    // Check if it's an admin or protected route
    // Note: next-intl routes look like /es/admin or /en/profile
    const isProtectedPath = pathname.includes('/(protected)') ||
        pathname.match(/\/(es|en|hi)\/(participa|planning|enlace|profile|tools)/);
    const isAdminPath = pathname.includes('/(admin)') ||
        pathname.match(/\/(es|en|hi)\/admin/);

    if ((isProtectedPath || isAdminPath) && !user) {
        // Find existing locale or use default
        const locale = pathname.split('/')[1] || i18n.defaultLocale;
        const loginUrl = new URL(`/${locale}/login`, request.url);

        // Return a redirect response while preserving cookies from the session update
        const redirectResponse = NextResponse.redirect(loginUrl);
        // Copy cookies and headers if necessary
        response.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value);
        });
        return redirectResponse;
    }

    // 3. Handle Localization
    return nextIntlMiddleware(request);
}

export const config = {
    // Matcher for both localized routes and session management
    matcher: ['/', '/(es|en|hi)/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
