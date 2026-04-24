import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendDonationReceiptEmail } from "@/lib/email";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER"] as const;

type Params = { receiptNumber: string };

export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { receiptNumber } = await params;
    const body = await request.json().catch(() => ({}));
    const manualTargetEmail = typeof body?.to === "string" ? body.to.trim() : "";

    const donation = await prisma.donation.findUnique({
        where: { receiptNumber },
        select: {
            receiptNumber: true,
            donorName: true,
            donorEmail: true,
            amount: true,
            purpose: true,
            paidAt: true,
            createdAt: true,
            razorpayPaymentId: true,
        },
    });

    if (!donation) {
        return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
    }

    const emailTo = manualTargetEmail || donation.donorEmail;
    if (!emailTo) {
        return NextResponse.json({ success: false, error: "Recipient email is missing" }, { status: 400 });
    }

    const emailSent = await sendDonationReceiptEmail(emailTo, {
        donorName: donation.donorName,
        amount: donation.amount,
        receiptNumber: donation.receiptNumber,
        date: (donation.paidAt || donation.createdAt).toISOString(),
        purpose: donation.purpose || "General Donation",
        transactionId: donation.razorpayPaymentId || `MANUAL-${donation.receiptNumber}`,
    });

    if (!emailSent) {
        return NextResponse.json({ success: false, error: "Failed to send receipt email" }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `Receipt emailed to ${emailTo}`,
        data: { receiptNumber: donation.receiptNumber, to: emailTo },
    });
}
