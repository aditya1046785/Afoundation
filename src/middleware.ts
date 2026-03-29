import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl, auth: session } = req as typeof req & { auth: { user?: { role?: string } } | null };
    const isLoggedIn = !!session?.user;
    const role = session?.user?.role;

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isMemberRoute = nextUrl.pathname.startsWith("/member");
    const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

    if (isAuthRoute && isLoggedIn) {
        if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") {
            return NextResponse.redirect(new URL("/admin", nextUrl));
        }
        return NextResponse.redirect(new URL("/member/dashboard", nextUrl));
    }

    if ((isAdminRoute || isMemberRoute) && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (isAdminRoute && isLoggedIn && role === "MEMBER") {
        return NextResponse.redirect(new URL("/member/dashboard", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*", "/member/:path*", "/login", "/register"],
};
