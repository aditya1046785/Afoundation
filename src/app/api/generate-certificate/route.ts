import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateCertificateSchema } from "@/lib/validations";
import { generateFoundationCertificateNo } from "@/lib/utils";
import { generateCertificateQRCode } from "@/lib/qr-generator";

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const parsed = generateCertificateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || "Invalid data" },
                { status: 400 }
            );
        }

        const { memberId, recipientName } = parsed.data;

        let resolvedName = recipientName?.trim() || "";
        if (!resolvedName && memberId) {
            const member = await prisma.member.findUnique({
                where: { id: memberId },
                include: { user: { select: { name: true } } },
            });

            if (!member) {
                return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
            }
            resolvedName = member.user.name;
        }

        if (!resolvedName) {
            return NextResponse.json({ success: false, error: "Recipient name is required" }, { status: 400 });
        }

        const certCount = await prisma.certificate.count();
        const certificateNo = generateFoundationCertificateNo(certCount);

        // Generate verification payload but do not persist as member-issued certificate.
        await generateCertificateQRCode(certificateNo);

        return NextResponse.json({
            success: true,
            data: {
                certificateNo,
                issueDate: new Date().toISOString(),
                memberName: resolvedName,
            },
            message: "Certificate prepared for download only. It was not issued to any member dashboard.",
        });
    } catch (error) {
        console.error("Generate certificate error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate certificate" }, { status: 500 });
    }
}
