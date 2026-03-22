import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { albumSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const adminMode = searchParams.get("admin") === "true";
    const where: Record<string, unknown> = {};
    if (!adminMode) where.isVisible = true;

    const albums = await prisma.galleryAlbum.findMany({
        where,
        include: { _count: { select: { photos: true } } },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: albums });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const validation = albumSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

    const existing = await prisma.galleryAlbum.findUnique({ where: { slug: validation.data.slug } });
    if (existing) return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });

    const album = await prisma.galleryAlbum.create({ data: validation.data });
    return NextResponse.json({ success: true, data: album }, { status: 201 });
}
