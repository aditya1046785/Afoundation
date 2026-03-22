import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import razorpay from "@/lib/razorpay";
import { donationSchema } from "@/lib/validations";
import { generateReceiptNumber } from "@/lib/utils";
import { sendDonationReceiptEmail } from "@/lib/email";

// GET — List donations (admin) or own donations (member)
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    let where: Record<string, unknown> = {};

    // Members can only see their own donations
    if (session.user.role === "MEMBER") {
        const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
        if (!member) return NextResponse.json({ success: true, data: { donations: [], total: 0 } });
        where.memberId = member.id;
    } else if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (search) {
        where.OR = [
            { donorName: { contains: search, mode: "insensitive" } },
            { donorEmail: { contains: search, mode: "insensitive" } },
            { receiptNumber: { contains: search, mode: "insensitive" } },
        ];
    }
    if (status) where.status = status;

    const [donations, total] = await Promise.all([
        prisma.donation.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
        }),
        prisma.donation.count({ where }),
    ]);

    return NextResponse.json({
        success: true,
        data: { donations, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
}
