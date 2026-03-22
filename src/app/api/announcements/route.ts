import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations";

// GET — Get active announcements (public or admin)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const adminMode = searchParams.get("admin") === "true";

    const now = new Date();
    const where: Record<string, unknown> = {};
    if (!adminMode) {
        where.isActive = true;
        where.startDate = { lte: now };
        where.OR = [{ endDate: null }, { endDate: { gte: now } }];
    }

    const announcements = await prisma.announcement.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: announcements });
}

// POST — Create announcement (admin only)
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const validation = announcementSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

    const { message, linkText, linkUrl, type, isActive, startDate, endDate } = validation.data;
    const announcement = await prisma.announcement.create({
        data: {
            message,
            linkText,
            linkUrl,
            type,
            isActive,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        },
    });
    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
}
