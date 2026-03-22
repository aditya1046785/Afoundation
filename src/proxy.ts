import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Public routes — always accessible
    const publicPaths = ["/", "/about", "/contact", "/blog", "/gallery", "/team", "/events", "/downloads", "/donate"];
    const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isApiRoute = pathname.startsWith("/api");
    const isStaticAsset = pathname.startsWith("/_next") || pathname.includes(".");

    // Skip static assets and API routes
    if (isStaticAsset || isApiRoute) return NextResponse.next();

    // Redirect authenticated users away from auth pages
    if (isAuthPage && token) {
        const role = (token as any).role;
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }

    // Allow public pages
    if (isPublic || isAuthPage) return NextResponse.next();

    // Protect dashboard routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/member")) {
        if (!token) {
            return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
        }

        // Admin-only pages
        if (pathname.startsWith("/admin")) {
            const role = (token as any).role;
            if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
                return NextResponse.redirect(new URL("/member/dashboard", request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
