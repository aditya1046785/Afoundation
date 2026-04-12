import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateMemberQRCode } from "@/lib/qr-generator";
import { generateCardNumber } from "@/lib/utils";
import { sendIDCardIssuedEmail } from "@/lib/email";

// GET — List ID cards
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId") || "";

    let where: Record<string, unknown> = {};
    if (session.user.role === "MEMBER") {
        const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
        if (!member) return NextResponse.json({ success: true, data: { idCards: [] } });
        where.memberId = member.id;
    } else if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    } else if (memberId) {
        where.memberId = memberId;
    }

    const idCards = await prisma.iDCard.findMany({
        where,
        include: {
            member: { include: { user: { select: { name: true, email: true, phone: true } } } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { idCards } });
}

// POST — Issue an ID card (Admin: pass memberId in body; Member: self-generates)
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);
    const isMember = session.user.role === "MEMBER";

    if (!isAdmin && !isMember) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        let memberId: string | undefined;
        let expiryMonths = 12;

        if (isAdmin) {
            // Admins must provide memberId in the body
            const body = await request.json();
            memberId = body.memberId;
            expiryMonths = body.expiryMonths ?? 12;

            if (!memberId) {
                return NextResponse.json({ success: false, error: "Member ID required" }, { status: 400 });
            }
        } else {
            // MEMBER: resolve their own member record from session
            const ownMember = await prisma.member.findUnique({ where: { userId: session.user.id } });
            if (!ownMember) {
                return NextResponse.json({ success: false, error: "Member profile not found" }, { status: 404 });
            }
            memberId = ownMember.id;
        }

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { user: { select: { name: true, email: true } } },
        });
        if (!member) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
        if (!member.isApproved) return NextResponse.json({ success: false, error: "Member must be approved first" }, { status: 400 });

        // Deactivate existing cards
        await prisma.iDCard.updateMany({ where: { memberId, isActive: true }, data: { isActive: false } });

        const cardCount = await prisma.iDCard.count();
        const cardNumber = generateCardNumber(cardCount);
        const qrCodeData = await generateMemberQRCode(member.memberId, member.user.name);

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

        const idCard = await prisma.iDCard.create({
            data: { memberId, cardNumber, expiryDate, qrCodeData, isActive: true },
        });

        const emailSent = await sendIDCardIssuedEmail(
            member.user.email,
            member.user.name,
            member.memberId,
            cardNumber,
            expiryDate.toISOString().slice(0, 10)
        );

        return NextResponse.json(
            {
                success: true,
                data: idCard,
                emailSent,
                message: emailSent
                    ? "ID card issued and email sent successfully."
                    : "ID card issued, but the email could not be sent.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Issue ID card error:", error);
        return NextResponse.json({ success: false, error: "Failed to issue ID card." }, { status: 500 });
    }
}
