import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { eventSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: event });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const validation = eventSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });
    const { title, slug, description, date, time, venue, image, isPublished } = validation.data;
    const event = await prisma.event.update({
        where: { id },
        data: { title, slug, description, date: new Date(date), time, venue, image, isPublished },
    });
    return NextResponse.json({ success: true, data: event });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Event deleted" });
}
