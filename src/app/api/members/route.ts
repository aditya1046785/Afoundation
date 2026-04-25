import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { memberSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email";

async function getNextMemberId(tx: Prisma.TransactionClient, retryOffset = 0): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `NF-${year}-`;

    const latest = await tx.member.findFirst({
        where: { memberId: { startsWith: prefix } },
        select: { memberId: true },
        orderBy: { memberId: "desc" },
    });

    const latestSeq = latest?.memberId ? Number.parseInt(latest.memberId.split("-").pop() || "0", 10) : 0;
    const baseSeq = Number.isFinite(latestSeq) && latestSeq > 0 ? latestSeq + 1 : 1;
    const finalSeq = baseSeq + retryOffset;

    return `${prefix}${String(finalSeq).padStart(4, "0")}`;
}

// GET — List all members (admin/manager only)
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const membershipType = searchParams.get("membershipType") || "";
    const isApproved = searchParams.get("isApproved");
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {};
    if (search) {
        where.OR = [
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { memberId: { contains: search, mode: "insensitive" } },
        ];
    }
    if (membershipType) where.membershipType = membershipType;
    if (isApproved !== null && isApproved !== undefined && isApproved !== "") {
        where.isApproved = isApproved === "true";
    }
    if (isActive !== null && isActive !== undefined && isActive !== "") {
        where.user = { ...((where.user as Record<string, unknown>) || {}), isActive: isActive === "true" };
    }

    const [members, total] = await Promise.all([
        prisma.member.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, position: true, role: true, isActive: true } },
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
        }),
        prisma.member.count({ where }),
    ]);

    return NextResponse.json({
        success: true,
        data: { members, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
}

// POST — Create a new member (admin only)
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validation = memberSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });
        }

        const { name, email, phone, password, fatherName, dateOfBirth, gender, address, city, state, pincode, aadharNumber, occupation, position, membershipType, photo } = validation.data;
        const isApproved = body.isApproved === true;

        // Check if email exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return NextResponse.json({ success: false, error: "Email already registered." }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password || "Admin@123", 10);

        let created: { user: { id: string }; member: { id: string; memberId: string } } | null = null;

        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                created = await prisma.$transaction(async (tx) => {
                    const memberId = await getNextMemberId(tx, attempt);

                    const user = await tx.user.create({
                        data: { name, email, phone, position, password: hashedPassword, role: "MEMBER" },
                        select: { id: true },
                    });

                    const member = await tx.member.create({
                        data: {
                            memberId,
                            userId: user.id,
                            fatherName,
                            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                            gender,
                            address,
                            city,
                            state,
                            pincode,
                            aadharNumber,
                            occupation,
                            membershipType: (membershipType as "GENERAL" | "LIFETIME" | "HONORARY" | "STUDENT") || "GENERAL",
                            photo,
                            isApproved,
                        },
                        select: { id: true, memberId: true },
                    });

                    await tx.donation.updateMany({ where: { donorEmail: email, memberId: null }, data: { memberId: member.id } });
                    return { user, member };
                });

                break;
            } catch (err) {
                if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") {
                    throw err;
                }

                const target = String(err.meta?.target || "");
                if (target.includes("memberId") && attempt < 4) {
                    continue;
                }

                if (target.includes("email")) {
                    return NextResponse.json({ success: false, error: "Email already registered." }, { status: 400 });
                }

                throw err;
            }
        }

        if (!created) {
            throw new Error("Unable to generate a unique Member ID. Please try again.");
        }

        const emailSent = await sendWelcomeEmail(email, name, created.member.memberId);

        return NextResponse.json(
            {
                success: true,
                data: { userId: created.user.id, memberRecordId: created.member.id, memberId: created.member.memberId },
                emailSent,
                message: emailSent
                    ? "Member created successfully and welcome email sent."
                    : "Member created successfully, but the welcome email could not be sent.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create member error:", error);
        return NextResponse.json({ success: false, error: "Failed to create member." }, { status: 500 });
    }
}
