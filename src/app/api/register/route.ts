import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { generateMemberId } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.issues[0]?.message },
                { status: 400 }
            );
        }

        const { name, phone, position, password } = validation.data;
        const email = validation.data.email.trim().toLowerCase();
        const referralCode = validation.data.referralCode?.trim() || null;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "Email already registered. Please login instead." },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique member ID
        const memberCount = await prisma.member.count();
        const memberId = generateMemberId(memberCount);

        let referredByMemberId: string | null = null;
        if (referralCode) {
            const referrer = await prisma.member.findUnique({
                where: { memberId: referralCode },
                select: { id: true },
            });

            if (!referrer) {
                return NextResponse.json(
                    { success: false, error: "Invalid referral link. Please use a valid member referral URL." },
                    { status: 400 }
                );
            }

            referredByMemberId = referrer.id;
        }

        // Create user + member in a transaction
        const { user, member } = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    phone,
                    position,
                    password: hashedPassword,
                    role: "MEMBER",
                },
            });

            const member = await tx.member.create({
                data: {
                    memberId,
                    userId: user.id,
                    membershipType: "GENERAL",
                    referredByMemberId,
                },
            });

            // AUTO-LINK: Connect any previous donations with this email to this member
            await tx.donation.updateMany({
                where: { donorEmail: email, memberId: null },
                data: { memberId: member.id },
            });

            return { user, member };
        });

        // Keep registration successful even if email delivery fails, but report true status to client.
        const welcomeEmailSent = await sendWelcomeEmail(email, name, memberId);

        return NextResponse.json(
            {
                success: true,
                message: welcomeEmailSent
                    ? "Registration successful! Please login."
                    : "Registration successful! Welcome email could not be delivered.",
                data: { userId: user.id, memberId: member.memberId, referredByMemberId },
                emailSent: welcomeEmailSent,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { success: false, error: "An error occurred during registration." },
            { status: 500 }
        );
    }
}
