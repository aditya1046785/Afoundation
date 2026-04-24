import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { manualDonationSchema } from "@/lib/validations";
import { generateReceiptNumber } from "@/lib/utils";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER"] as const;

async function getUniqueReceiptNumber(): Promise<string> {
    const donationCount = await prisma.donation.count();

    for (let offset = 0; offset < 20; offset++) {
        const candidate = generateReceiptNumber(donationCount + offset);
        const existing = await prisma.donation.findUnique({
            where: { receiptNumber: candidate },
            select: { id: true },
        });

        if (!existing) return candidate;
    }

    const year = new Date().getFullYear();
    const randomSeq = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    return `DON-${year}-${randomSeq}`;
}

function normalizeOptionalString(value?: string) {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
    const search = (searchParams.get("search") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const source = (searchParams.get("source") || "").trim();
    const paymentMode = (searchParams.get("paymentMode") || "").trim();
    const referralOnly = searchParams.get("referralOnly") === "true";

    const fromDate = searchParams.get("from") ? new Date(searchParams.get("from") as string) : null;
    const toDate = searchParams.get("to") ? new Date(searchParams.get("to") as string) : null;

    const where: Record<string, unknown> = {};

    if (search) {
        where.OR = [
            { donorName: { contains: search, mode: "insensitive" } },
            { donorEmail: { contains: search, mode: "insensitive" } },
            { receiptNumber: { contains: search, mode: "insensitive" } },
            { razorpayPaymentId: { contains: search, mode: "insensitive" } },
            { referrerMember: { memberId: { contains: search, mode: "insensitive" } } },
            { referrerMember: { user: { name: { contains: search, mode: "insensitive" } } } },
        ];
    }

    if (status) where.status = status;

    if (source === "ONLINE" || source === "OFFLINE" || source === "MANUAL") {
        where.source = source;
    }

    if (paymentMode) {
        where.paymentMode = paymentMode;
    }
    if (referralOnly) where.referrerMemberId = { not: null };

    if (fromDate || toDate) {
        const paidAtFilter: { gte?: Date; lte?: Date } = {};
        if (fromDate && !Number.isNaN(fromDate.getTime())) {
            paidAtFilter.gte = fromDate;
        }
        if (toDate && !Number.isNaN(toDate.getTime())) {
            paidAtFilter.lte = toDate;
        }
        if (Object.keys(paidAtFilter).length > 0) {
            where.paidAt = paidAtFilter;
        }
    }

    const [rows, total] = await Promise.all([
        prisma.donation.findMany({
            where,
            include: {
                member: {
                    select: {
                        id: true,
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
                        id: true,
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
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.donation.count({ where }),
    ]);
    const receiptRows = rows as any[];

    const receipts = receiptRows.map((row) => ({
        id: row.id,
        receiptNumber: row.receiptNumber,
        amount: row.amount,
        currency: row.currency,
        donorName: row.donorName,
        donorEmail: row.donorEmail,
        donorPhone: row.donorPhone,
        donorPAN: row.donorPAN,
        source: row.source,
        paymentMode: row.paymentMode,
        paymentReference: row.paymentReference || row.razorpayPaymentId || row.razorpayOrderId || null,
        transactionId: row.paymentReference || row.razorpayPaymentId || row.razorpayOrderId || null,
        status: row.status,
        purpose: row.purpose,
        message: row.message,
        notes: row.notes,
        paidAt: row.paidAt,
        receiptIssuedAt: row.paidAt,
        createdAt: row.createdAt,
        member: row.member,
        isReferral: Boolean(row.referrerMemberId),
        referralCodeUsed: row.referrerMember?.memberId || null,
        referral: row.referrerMember
            ? {
                id: row.referrerMember.id,
                memberId: row.referrerMember.memberId,
                name: row.referrerMember.user?.name || null,
                email: row.referrerMember.user?.email || null,
            }
            : null,
        recordedByUserId: row.recordedByUserId,
        recordedByName: null,
        receivedBy: row.receivedBy,
    }));

    return NextResponse.json({
        success: true,
        data: {
            receipts,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number])) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validation = manualDonationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.issues[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const data = validation.data;
        const donorPhone = normalizeOptionalString(data.donorPhone);
        const donorPAN = normalizeOptionalString(data.donorPAN);
        const purpose = normalizeOptionalString(data.purpose);
        const notes = normalizeOptionalString(data.notes);
        const receivedBy = normalizeOptionalString(data.receivedBy) || session.user.name || null;
        const paymentReference = normalizeOptionalString(data.paymentReference);

        let memberId = normalizeOptionalString(data.memberId);

        if (!memberId) {
            const memberByEmail = await prisma.member.findFirst({
                where: { user: { email: data.donorEmail } },
                select: { id: true },
            });
            memberId = memberByEmail?.id || null;
        }

        let referrerMemberId = normalizeOptionalString(data.referrerMemberId);
        let referralCodeUsed: string | null = null;

        if (!referrerMemberId && data.referralCode) {
            const referralMember = await prisma.member.findUnique({
                where: { memberId: data.referralCode },
                select: { id: true, memberId: true },
            });

            referrerMemberId = referralMember?.id || null;
            referralCodeUsed = referralMember?.memberId || null;
        }

        if (referrerMemberId) {
            const referrer = await prisma.member.findUnique({
                where: { id: referrerMemberId },
                select: { id: true, memberId: true },
            });

            referrerMemberId = referrer?.id || null;
            referralCodeUsed = referrer?.memberId || referralCodeUsed;
        }

        // Do not allow self-referral on member-linked manual donations.
        if (memberId && referrerMemberId && memberId === referrerMemberId) {
            referrerMemberId = null;
            referralCodeUsed = null;
        }

        const receiptNumber = await getUniqueReceiptNumber();
        const now = new Date();
        const metadataNotes = [
            `Source: ${data.source}`,
            `Payment mode: ${data.paymentMode}`,
            paymentReference ? `Payment reference: ${paymentReference}` : null,
            receivedBy ? `Received by: ${receivedBy}` : null,
            notes,
        ].filter(Boolean).join(" | ");

        const donation = await prisma.donation.create({
            data: {
                amount: data.amount,
                currency: "INR",
                source: data.source,
                paymentMode: data.paymentMode,
                paymentReference,
                receivedBy,
                recordedByUserId: session.user.id,
                donorName: data.donorName,
                donorEmail: data.donorEmail,
                donorPhone,
                donorPAN,
                memberId,
                referrerMemberId,
                receiptNumber,
                purpose,
                message: metadataNotes || null,
                notes,
                status: "COMPLETED",
                paidAt: now,
                receiptIssuedAt: now,
            } as any,
            include: {
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
        }) as any;

        return NextResponse.json({
            success: true,
            message: "Receipt generated successfully",
            data: {
                id: donation.id,
                receiptNumber: donation.receiptNumber,
                amount: donation.amount,
                donorName: donation.donorName,
                donorEmail: donation.donorEmail,
                source: data.source,
                paymentMode: data.paymentMode,
                paymentReference,
                transactionId: paymentReference,
                status: donation.status,
                paidAt: donation.paidAt,
                receiptIssuedAt: donation.paidAt,
                recordedByUserId: session.user.id,
                recordedByName: session.user.name || null,
                receivedBy,
                referralCodeUsed,
                isReferral: Boolean(donation.referrerMemberId),
                referral: donation.referrerMember
                    ? {
                        memberId: donation.referrerMember.memberId,
                        name: donation.referrerMember.user?.name || null,
                        email: donation.referrerMember.user?.email || null,
                    }
                    : null,
            },
        });
    } catch (error) {
        console.error("Manual receipt creation error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate receipt" }, { status: 500 });
    }
}
