import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendMemberApprovedEmail, sendMemberRejectedEmail } from "@/lib/email";

// POST — Approve or reject a member
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body; // action: "approve" | "reject"

    const member = await prisma.member.findUnique({
        where: { id },
        include: { user: { select: { name: true, email: true } } },
    });

    if (!member) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });

    if (action === "approve") {
        await prisma.member.update({ where: { id }, data: { isApproved: true } });
        const emailSent = await sendMemberApprovedEmail(member.user.email, member.user.name, member.memberId);
        return NextResponse.json({
            success: true,
            message: emailSent ? "Member approved successfully" : "Member approved, but approval email could not be sent",
            emailSent,
        });
    } else if (action === "reject") {
        await prisma.member.update({ where: { id }, data: { isApproved: false } });
        await prisma.user.update({ where: { id: member.userId }, data: { isActive: false } });
        const emailSent = await sendMemberRejectedEmail(member.user.email, member.user.name, reason || "Your application did not meet our current requirements.");
        return NextResponse.json({
            success: true,
            message: emailSent ? "Member rejected" : "Member rejected, but rejection email could not be sent",
            emailSent,
        });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
}
