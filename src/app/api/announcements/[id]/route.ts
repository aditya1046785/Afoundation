import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const { message, linkText, linkUrl, type, isActive, startDate, endDate } = body;
    const announcement = await prisma.announcement.update({
        where: { id },
        data: { message, linkText, linkUrl, type, isActive, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : null },
    });
    return NextResponse.json({ success: true, data: announcement });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Announcement deleted" });
}
