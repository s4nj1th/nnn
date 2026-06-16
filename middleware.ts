import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/editor"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });
    const { pathname } = request.nextUrl;

    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
    const isProtectedRoute = PROTECTED_ROUTES.some((r) =>
        pathname.startsWith(r),
    );

    if (!isAuthRoute && !isProtectedRoute) {
        return supabaseResponse;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(
                    cookiesToSet: {
                        name: string;
                        value: string;
                        options?: Record<string, unknown>;
                    }[],
                ) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(
                            name,
                            value,
                            options as Parameters<
                                typeof supabaseResponse.cookies.set
                            >[2],
                        ),
                    );
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!user && isProtectedRoute) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
