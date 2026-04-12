import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

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
            if (user) {
                token.id = user.id;
                token.role = (user as { role: string }).role;
                token.isApproved = (user as { isApproved?: boolean }).isApproved ?? true;
            }

            // For MEMBER role, always fetch latest approval status from DB
            if (token.role === "MEMBER" && token.id) {
                try {
                    const member = await prisma.member.findUnique({
                        where: { userId: token.id as string },
                        select: { isApproved: true },
                    });
                    token.isApproved = member?.isApproved ?? false;
                } catch (error) {
                    // If there's an error fetching, keep existing value
                    console.error("Error fetching member approval status:", error);
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
