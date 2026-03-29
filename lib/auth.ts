import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
    adapter: PrismaAdapter(prisma) as NextAuthConfig["adapter"],
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        password: true,
                        role: true,
                        image: true,
                        isActive: true,
                    },
                });

                if (!user || !user.isActive) return null;

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!passwordMatch) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role: string }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
        async authorized({ auth, request }) {
            const { pathname } = request.nextUrl;
            const role = (auth?.user as { role?: string })?.role;
            const isLoggedIn = !!auth?.user;

            const isAdminRoute = pathname.startsWith("/admin");
            const isMemberRoute = pathname.startsWith("/member");
            const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

            if (isAuthPage && isLoggedIn) {
                if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") {
                    return Response.redirect(new URL("/admin", request.nextUrl));
                }
                return Response.redirect(new URL("/member/dashboard", request.nextUrl));
            }

            if ((isAdminRoute || isMemberRoute) && !isLoggedIn) {
                return Response.redirect(new URL("/login", request.nextUrl));
            }

            if (isAdminRoute && isLoggedIn && role === "MEMBER") {
                return Response.redirect(new URL("/member/dashboard", request.nextUrl));
            }

            return true;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
