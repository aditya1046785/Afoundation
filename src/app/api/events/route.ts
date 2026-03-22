import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { eventSchema } from "@/lib/validations";

// GET — List events
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const published = searchParams.get("published");

    const where: Record<string, unknown> = {};
    if (published !== null && published !== undefined && published !== "") {
        where.isPublished = published === "true";
    }

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { date: "desc" },
        }),
        prisma.event.count({ where }),
    ]);

    return NextResponse.json({
        success: true,
        data: { events, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
}

// POST — Create event (admin only)
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validation = eventSchema.safeParse(body);
        if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

        const { title, slug, description, date, time, venue, image, isPublished } = validation.data;

        // Check slug uniqueness
        const existing = await prisma.event.findUnique({ where: { slug } });
        if (existing) return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });

        const event = await prisma.event.create({
            data: { title, slug, description, date: new Date(date), time, venue, image, isPublished },
        });
        return NextResponse.json({ success: true, data: event }, { status: 201 });
    } catch (error) {
        console.error("Create event error:", error);
        return NextResponse.json({ success: false, error: "Failed to create event." }, { status: 500 });
    }
}
