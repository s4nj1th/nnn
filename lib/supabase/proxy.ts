import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/editor"];
const AUTH_ROUTES = ["/login", "/signup"];

function isAuthRoute(pathname: string) {
    return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string) {
    return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function hasAuthCookie(request: NextRequest) {
    return request.cookies
        .getAll()
        .some(({ name }) => name.includes("-auth-token"));
}

function copyCookies(from: NextResponse, to: NextResponse) {
    from.cookies.getAll().forEach(({ name, value }) => {
        to.cookies.set(name, value);
    });
}

export async function updateSession(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!isAuthRoute(pathname) && !isProtectedRoute(pathname)) {
        return NextResponse.next({ request });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        if (isProtectedRoute(pathname)) {
            const redirectUrl = new URL("/login", request.url);
            redirectUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next({ request });
    }

    if (!hasAuthCookie(request)) {
        if (isProtectedRoute(pathname)) {
            const redirectUrl = new URL("/login", request.url);
            redirectUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet, headers) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value),
                );
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options),
                );
                Object.entries(headers).forEach(([key, value]) =>
                    supabaseResponse.headers.set(key, value),
                );
            },
        },
    });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (user && isAuthRoute(pathname)) {
        const redirectResponse = NextResponse.redirect(
            new URL("/dashboard", request.url),
        );
        copyCookies(supabaseResponse, redirectResponse);
        return redirectResponse;
    }

    if (!user && isProtectedRoute(pathname)) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirectTo", pathname);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        copyCookies(supabaseResponse, redirectResponse);
        return redirectResponse;
    }

    return supabaseResponse;
}
