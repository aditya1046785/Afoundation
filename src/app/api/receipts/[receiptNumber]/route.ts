import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const donation = (await prisma.donation.findUnique({
        where: { receiptNumber },
        include: {
            member: {
                select: {
                    memberId: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            referrerMember: {
                select: {
                    memberId: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    })) as any;

    if (!donation) {
        return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        data: {
            id: donation.id,
            receiptNumber: donation.receiptNumber,
            amount: donation.amount,
            currency: donation.currency,
            donorName: donation.donorName,
            donorEmail: donation.donorEmail,
            donorPhone: donation.donorPhone,
            donorPAN: donation.donorPAN,
            source: donation.source,
            paymentMode: donation.paymentMode,
            paymentReference: donation.paymentReference || donation.razorpayPaymentId || donation.razorpayOrderId || null,
            transactionId: donation.paymentReference || donation.razorpayPaymentId || donation.razorpayOrderId || null,
            status: donation.status,
            purpose: donation.purpose,
            notes: null,
            paidAt: donation.paidAt,
            receiptIssuedAt: donation.paidAt,
            receivedBy: null,
            referralCodeUsed: donation.referrerMember?.memberId || null,
            isReferral: Boolean(donation.referrerMemberId),
            member: donation.member,
            referral: donation.referrerMember
                ? {
                    memberId: donation.referrerMember.memberId,
                    name: donation.referrerMember.user?.name || null,
                    email: donation.referrerMember.user?.email || null,
                }
                : null,
        },
    });
}
