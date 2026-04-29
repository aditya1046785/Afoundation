import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateReceiptPdfBuffer } from "@/lib/receipt-pdf";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER"] as const;

type Params = { receiptNumber: string };

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
    const { receiptNumber } = await params;
    const paymentId = request.nextUrl.searchParams.get("paymentId")?.trim() || null;
    const session = await auth();
    const isAdmin = Boolean(session?.user && ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number]));
    const allowPublicDownload = Boolean(paymentId);

    if (!isAdmin && !allowPublicDownload) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const donation = (await prisma.donation.findUnique({
        where: { receiptNumber },
        select: {
            receiptNumber: true,
            donorName: true,
            donorEmail: true,
            donorPhone: true,
            donorPAN: true,
            amount: true,
            purpose: true,
            status: true,
            paymentReference: true,
            razorpayPaymentId: true,
            razorpayOrderId: true,
            paidAt: true,
            createdAt: true,
        },
    } as any)) as any;

    if (!donation) {
        return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
    }

    if (!isAdmin) {
        const knownPaymentId = donation.paymentReference || donation.razorpayPaymentId || null;
        if (!knownPaymentId || paymentId !== knownPaymentId || donation.status !== "COMPLETED") {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
    }

    const pdfBuffer = await generateReceiptPdfBuffer({
        receiptNumber: donation.receiptNumber,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorPhone: donation.donorPhone,
        donorPAN: donation.donorPAN,
        amount: donation.amount,
        purpose: donation.purpose,
        transactionId: donation.paymentReference || donation.razorpayPaymentId || donation.razorpayOrderId || null,
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
