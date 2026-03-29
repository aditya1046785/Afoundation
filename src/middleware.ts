import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req: request, secret });
    const { pathname } = request.nextUrl;

    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isAdminRoute = pathname.startsWith("/admin");
    const isMemberRoute = pathname.startsWith("/member");

    if (isAuthPage && token) {
        const role = (token as { role?: string }).role;
        if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }

    if ((isAdminRoute || isMemberRoute) && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAdminRoute && token) {
        const role = (token as { role?: string }).role;
        if (role === "MEMBER") {
            return NextResponse.redirect(new URL("/member/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/member/:path*", "/login", "/register"],
};
