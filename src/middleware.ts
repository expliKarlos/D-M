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
        console.log('[Middleware] Admin path detected:', pathname);
        console.log('[Middleware] User email:', user?.email);

        // 1. Check environment variable (primary admins)
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        console.log('[Middleware] Env admin emails:', adminEmails);
        let isAdmin = user && adminEmails.includes(user.email || '');
        console.log('[Middleware] Is env admin?', isAdmin);

        // 2. If not in env var, check database whitelist
        if (!isAdmin && user?.email) {
            console.log('[Middleware] Checking database for:', user.email);
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    { auth: { persistSession: false } }
                );

                console.log('[Middleware] Supabase client created');

                const { data, error } = await supabaseAdmin
                    .from('admin_whitelist')
                    .select('email')
                    .eq('email', user.email.toLowerCase())
                    .maybeSingle();

                console.log('[Middleware] DB query result:', { data, error });

                if (error) {
                    console.error('[Middleware] DB query error:', error);
                } else {
                    isAdmin = !!data;
                    console.log('[Middleware] Is DB admin?', isAdmin);
                }
            } catch (error) {
                console.error('[Middleware] Exception checking admin whitelist:', error);
            }
        }

        console.log('[Middleware] Final isAdmin decision:', isAdmin);

        if (!isAdmin) {
            console.log('[Middleware] Redirecting to home - not admin');
            // Not admin, redirect to home
            const locale = pathname.split('/')[1];
            const targetLocale = i18n.locales.includes(locale as any) ? locale : i18n.defaultLocale;
            const homeUrl = new URL(`/${targetLocale}`, request.url);
            return NextResponse.redirect(homeUrl);
        }

        console.log('[Middleware] Allowing access to admin panel');
    }

    return i18nResponse;
}

export const config = {
    // Matcher for all routes except static assets
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
