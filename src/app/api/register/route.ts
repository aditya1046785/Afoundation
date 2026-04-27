import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email";

const MAX_MEMBER_ID_RETRIES = 5;

async function getNextMemberId(tx: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `NF-${year}-`;

    const latestForYear = await tx.member.findFirst({
        where: { memberId: { startsWith: prefix } },
        orderBy: { memberId: "desc" },
        select: { memberId: true },
    });

    const latestSeq = latestForYear?.memberId.split("-").pop() || "0";
    const parsed = Number.parseInt(latestSeq, 10);
    const nextSeq = Number.isFinite(parsed) ? parsed + 1 : 1;

    return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

function isMemberIdUniqueConflict(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        return false;
    }

    const target = error.meta?.target;
    if (Array.isArray(target)) {
        return target.some((field) => String(field).includes("memberId"));
    }

    return typeof target === "string" && target.includes("memberId");
}

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

        // Create user + member in a transaction with memberId retry safety for concurrent registrations.
        let created: { user: { id: string }; member: { id: string; memberId: string } } | null = null;

        for (let attempt = 1; attempt <= MAX_MEMBER_ID_RETRIES; attempt += 1) {
            try {
                created = await prisma.$transaction(async (tx) => {
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

                    const memberId = await getNextMemberId(tx);

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

                break;
            } catch (error) {
                if (isMemberIdUniqueConflict(error) && attempt < MAX_MEMBER_ID_RETRIES) {
                    continue;
                }
                throw error;
            }
        }

        if (!created) {
            throw new Error("Failed to allocate unique member ID");
        }

        const { user, member } = created;

        // Keep registration successful even if email delivery fails, but report true status to client.
        const welcomeEmailSent = await sendWelcomeEmail(email, name, member.memberId);

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
