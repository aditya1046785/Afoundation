import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateReceiptPdfBuffer } from "@/lib/receipt-pdf";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER"] as const;

type Params = { receiptNumber: string };

export async function GET(_request: NextRequest, { params }: { params: Promise<Params> }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { receiptNumber } = await params;

    const donation = await prisma.donation.findUnique({
        where: { receiptNumber },
        select: {
            receiptNumber: true,
            donorName: true,
            donorEmail: true,
            donorPhone: true,
            donorPAN: true,
            amount: true,
            purpose: true,
            paidAt: true,
            createdAt: true,
        },
    });

    if (!donation) {
        return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
    }

    const pdfBuffer = await generateReceiptPdfBuffer({
        receiptNumber: donation.receiptNumber,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        donorPAN: donation.donorPAN,
        amount: donation.amount,
        purpose: donation.purpose,
        date: donation.paidAt || donation.createdAt,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=Receipt-${donation.receiptNumber}.pdf`,
            "Cache-Control": "private, max-age=60",
        },
    });
}
