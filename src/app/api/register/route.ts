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

        const { name, email, phone, password } = validation.data;

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

        // Create user + member in a transaction
        const { user, member } = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    phone,
                    password: hashedPassword,
                    role: "MEMBER",
                },
            });

            const member = await tx.member.create({
                data: {
                    memberId,
                    userId: user.id,
                    membershipType: "GENERAL",
                },
            });

            // AUTO-LINK: Connect any previous donations with this email to this member
            await tx.donation.updateMany({
                where: { donorEmail: email, memberId: null },
                data: { memberId: member.id },
            });

            return { user, member };
        });

        // Send welcome email (don't block response if it fails)
        await sendWelcomeEmail(email, name, memberId);

        return NextResponse.json(
            {
                success: true,
                message: "Registration successful! Please login.",
                data: { userId: user.id, memberId: member.memberId },
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
