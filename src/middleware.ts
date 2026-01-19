import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from '@/lib/config/i18n';
import { updateSession } from '@/lib/utils/supabase/middleware';

function getLocale(request: NextRequest): string | undefined {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    // @ts-ignore locales are readonly
    const locales: string[] = i18n.locales;

    // Use negotiator and intl-localematcher to get best locale
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
        locales
    );

    const locale = matchLocale(languages, locales, i18n.defaultLocale);

    return locale;
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Refresh Supabase session and get user
    const { response, user } = await updateSession(request);

    // 2. Define Public Routes (no auth required)
    const publicPaths = ['/login', '/auth', '/info'];

    // Check if path is public (handling i18n prefixes)
    // e.g. /es/login should match /login
    const isPublicRoute =
        publicPaths.some(path =>
            pathname.startsWith(path) ||
            i18n.locales.some(locale => pathname.startsWith(`/${locale}${path}`))
        ) || pathname === '/';

    // 3. Auth Check
    if (!user && !isPublicRoute) {
        const locale = getLocale(request) || i18n.defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // 4. i18n Redirection Logic
    // Only apply if we are NOT in an API route or special Next.js path (handled by matcher)
    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);

        // Construct new URL with locale
        const newUrl = new URL(
            `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
            request.url
        );

        // Preserve query parameters
        newUrl.search = request.nextUrl.search;

        // If we are already returning a response from Supabase (e.g. cookie update),
        // we need to return a redirect response but try to preserve cookies if possible.
        // However, NextResponse.redirect creates a *new* response.
        // Ideally, we redirect first if locale is missing.
        return NextResponse.redirect(newUrl);
    }

    return response;
}

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ['/((?!api|_next/static|_next/image|images/|auth/|favicon.ico).*)'],
};
