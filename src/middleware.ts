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
    // 1. Handle Supabase session and Auth (always update session for data fetching in server)
    const { response, user } = await updateSession(request);

    const pathname = request.nextUrl.pathname;

    // 2. Localization
    // Check if it's an auth route - if so, we skip next-intl to avoid 404 on callbacks
    const isAuthRoute = pathname.startsWith('/auth');

    if (isAuthRoute) {
        // For auth routes, we just return the original response with updated session cookies
        return response;
    }

    // We get the i18n response first, then we can augment it or redirect if needed
    const i18nResponse = nextIntlMiddleware(request);

    // Copy cookies from session update to i18n response
    response.cookies.getAll().forEach(cookie => {
        i18nResponse.cookies.set(cookie.name, cookie.value);
    });


    // 3. Route Protection Logic

    // Public paths (always accessible)
    // - /login, /auth/*, /info/*, /enlace, / (root)
    const isPublicPath =
        pathname.includes('/login') ||
        pathname.includes('/auth') ||
        pathname.includes('/info') ||
        pathname.includes('/enlace') ||
        pathname === '/' ||
        i18n.locales.some(loc => pathname === `/${loc}` || pathname.startsWith(`/${loc}/login`));

    // Protected paths (require authentication)
    const isProtectedPath = !isPublicPath;

    if (isProtectedPath && !user) {
        // Redirect to login (preserving locale)
        const locale = pathname.split('/')[1];
        const targetLocale = i18n.locales.includes(locale as any) ? locale : i18n.defaultLocale;
        const loginUrl = new URL(`/${targetLocale}/login`, request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Admin paths (require admin email)
    const isAdminPath = pathname.match(/\/(es|en|hi)\/admin/) || pathname.includes('/admin');

    if (isAdminPath) {
        // 1. Check environment variable (primary admins)
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        let isAdmin = user && adminEmails.includes(user.email || '');

        // 2. If not in env var, check database whitelist
        if (!isAdmin && user?.email) {
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    { auth: { persistSession: false } }
                );

                const { data } = await supabaseAdmin
                    .from('admin_whitelist')
                    .select('email')
                    .eq('email', user.email.toLowerCase())
                    .maybeSingle();

                isAdmin = !!data;
            } catch (error) {
                console.error('Error checking admin whitelist in middleware:', error);
            }
        }

        if (!isAdmin) {
            // Not admin, redirect to home
            const locale = pathname.split('/')[1];
            const targetLocale = i18n.locales.includes(locale as any) ? locale : i18n.defaultLocale;
            const homeUrl = new URL(`/${targetLocale}`, request.url);
            return NextResponse.redirect(homeUrl);
        }
    }

    return i18nResponse;
}

export const config = {
    // Matcher for all routes except static assets
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
