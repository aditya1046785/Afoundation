import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const STATUS_REFRESH_MS = 60_000;

export const authConfig: NextAuthConfig = {
    adapter: PrismaAdapter(prisma) as NextAuthConfig["adapter"],
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
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

                const email = String(credentials.email).trim().toLowerCase();

                const user = await prisma.user.findUnique({
                    where: { email },
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

                let isApproved = true;
                if (user.role === "MEMBER") {
                    const member = await prisma.member.findUnique({
                        where: { userId: user.id },
                        select: { isApproved: true },
                    });

                    isApproved = member?.isApproved ?? false;
                }

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
                    isApproved,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Initial login: user is present
            if (user) {
                token.id = user.id;
                token.role = (user as { role: string }).role;
                token.isApproved = (user as { isApproved?: boolean }).isApproved ?? true;
                token.statusCheckedAt = Date.now();
                return token;
            }

            if (!token.id) {
                return token;
            }

            const now = Date.now();
            const lastChecked = typeof token.statusCheckedAt === "number" ? token.statusCheckedAt : 0;

            // Only re-verify against DB if more than STATUS_REFRESH_MS has passed
            if (now - lastChecked > STATUS_REFRESH_MS) {
                try {
                    const member = await prisma.member.findUnique({
                        where: { userId: token.id as string },
                        select: {
                            id: true,
                            isApproved: true,
                            user: {
                                select: {
                                    role: true,
                                    isActive: true,
                                },
                            },
                        },
                    });

                    // If member record not found in DB (e.g. member deleted), invalidate token
                    if (!member) {
                        if (!token.role || token.role === "MEMBER") {
                            return null;
                        }

                        // For non-member roles (e.g. SUPER_ADMIN/ADMIN), check if user still exists
                        const userRecord = await prisma.user.findUnique({
                            where: { id: token.id as string },
                            select: { id: true, role: true, isActive: true },
                        });

                        if (!userRecord || !userRecord.isActive) {
                            return null;
                        }

                        token.role = userRecord.role;
                        token.statusCheckedAt = now;
                        return token;
                    }

                    // If user account is deactivated, invalidate token
                    if (member.user && !member.user.isActive) {
                        return null;
                    }

                    // Refresh token fields
                    token.isApproved = member.isApproved;
                    token.role = member.user?.role ?? (member as { role?: string }).role ?? token.role;
                    token.statusCheckedAt = now;
                } catch (error) {
                    // Fail-open for availability: log error and return old token without updating statusCheckedAt so next request retries
                    console.error("Error refreshing member token status:", error);
                    return token;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.isApproved = token.isApproved as boolean;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
