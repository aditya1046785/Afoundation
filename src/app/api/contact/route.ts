import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";

// POST — Submit contact form (public)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = contactSchema.safeParse(body);
        if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

        const message = await prisma.contactMessage.create({ data: validation.data });
        return NextResponse.json({ success: true, data: message, message: "Message sent successfully!" }, { status: 201 });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json({ success: false, error: "Failed to send message." }, { status: 500 });
    }
}

// GET — List contact messages (admin only)
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const isRead = searchParams.get("isRead");

    const where: Record<string, unknown> = {};
    if (isRead !== null && isRead !== undefined && isRead !== "") {
        where.isRead = isRead === "true";
    }

    const [messages, total] = await Promise.all([
        prisma.contactMessage.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
        }),
        prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({
        success: true,
        data: { messages, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
}
