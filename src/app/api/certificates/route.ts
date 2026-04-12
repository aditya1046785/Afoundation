import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { certificateSchema } from "@/lib/validations";
import { generateCertificateNo } from "@/lib/utils";
import { generateCertificateQRCode } from "@/lib/qr-generator";
import { sendCertificateIssuedEmail } from "@/lib/email";
import { CERTIFICATE_LABELS } from "@/lib/constants";

// GET — List certificates
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const memberId = searchParams.get("memberId") || "";

    let where: Record<string, unknown> = {};
    if (session.user.role === "MEMBER") {
        const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
        if (!member) return NextResponse.json({ success: true, data: { certificates: [], total: 0 } });
        where.memberId = member.id;
    } else if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    } else if (memberId) {
        where.memberId = memberId;
    }

    const [certificates, total] = await Promise.all([
        prisma.certificate.findMany({
            where,
            include: {
                member: {
                    include: { user: { select: { name: true, email: true } } },
                },
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
        }),
        prisma.certificate.count({ where }),
    ]);

    return NextResponse.json({
        success: true,
        data: { certificates, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
}

// POST — Issue a certificate
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validation = certificateSchema.safeParse(body);
        if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

        const { memberId, type, title, description, issuedBy } = validation.data;

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { user: { select: { name: true, email: true } } },
        });
        if (!member) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });

        const certCount = await prisma.certificate.count();
        const certificateNo = generateCertificateNo(certCount);
        const qrCodeData = await generateCertificateQRCode(certificateNo);

        const certificate = await prisma.certificate.create({
            data: {
                certificateNo,
                memberId,
                type,
                title,
                description,
                issuedBy,
                qrCodeData,
            },
        });

        const certTypeLabel = CERTIFICATE_LABELS[type] || type;
        const emailSent = await sendCertificateIssuedEmail(member.user.email, member.user.name, certTypeLabel, certificateNo);

        return NextResponse.json(
            {
                success: true,
                data: certificate,
                emailSent,
                message: emailSent
                    ? "Certificate issued and email sent successfully."
                    : "Certificate issued, but the email could not be sent.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Issue certificate error:", error);
        return NextResponse.json({ success: false, error: "Failed to issue certificate." }, { status: 500 });
    }
}
