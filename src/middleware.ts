import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname !== "/login" && pathname !== "/register") {
        return NextResponse.next();
    }

    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req: request, secret });

    if (token) {
        const role = (token as { role?: string }).role;
        if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/register"],
};
