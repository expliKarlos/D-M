import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { i18n } from '@/lib/config/i18n';
import { updateSession } from '@/lib/utils/supabase/middleware';

const handleI18n = createMiddleware({
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
    localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
    // 1. Update Supabase Session
    // This allows us to access the user in Server Components and refreshes the token if needed
    const { response, user } = await updateSession(request);

    // 2. Handle i18n routing
    const i18nResponse = handleI18n(request);

    // 3. Chain responses
    // We need to copy the cookies from the Supabase response to the i18n response
    // because next-intl creates a new response object (redirect or rewrite)
    response.cookies.getAll().forEach((cookie) => {
        i18nResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    const pathname = request.nextUrl.pathname;

    // Public Routes Logic
    // If user is NOT authenticated, redirect to login
    // Exception: /login, /auth, /info, / and public assets
    // Simplified logic: If no user, and trying to access protected route -> Redirect to Login

    // Check if path is protected
    // Protected: NOT /login, NOT /auth, NOT /info, NOT public assets
    // We check for localized version too: /es/login

    const isPublic =
        pathname.startsWith('/auth') ||
        pathname.includes('/login') ||
        pathname.includes('/info') ||
        pathname === '/' ||
        i18n.locales.some(loc => pathname === `/${loc}` || pathname.startsWith(`/${loc}/login`));

    if (!user && !isPublic) {
        // Redirect to login (preserving locale if present)
        const locale = request.nextUrl.pathname.split('/')[1];
        const targetLocale = i18n.locales.includes(locale as any) ? locale : i18n.defaultLocale;

        const loginUrl = new URL(`/${targetLocale}/login`, request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Admin Route Protection
    if (pathname.includes('/admin')) {
        // Get admin emails from environment variable
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

        // Check if user is authenticated and is admin
        if (!user) {
            // Not authenticated, redirect to login
            const locale = pathname.split('/')[1];
            const targetLocale = i18n.locales.includes(locale as any) ? locale : i18n.defaultLocale;
            const loginUrl = new URL(`/${targetLocale}/login`, request.url);
            return NextResponse.redirect(loginUrl);
        }

        if (!adminEmails.includes(user.email || '')) {
            // Authenticated but not admin, redirect to home
            const locale = pathname.split('/')[1];
            const targetLocale = i18n.locales.includes(locale as any) ? locale : i18n.defaultLocale;
            const homeUrl = new URL(`/${targetLocale}`, request.url);
            return NextResponse.redirect(homeUrl);
        }

        // User is admin, allow access
    }

    return i18nResponse;
}

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ['/((?!api|_next/static|_next/image|images/|auth/|favicon.ico).*)'],
};
