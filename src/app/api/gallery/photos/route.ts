import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const { albumId, imageUrl, caption, displayOrder } = body;
    if (!albumId || !imageUrl) return NextResponse.json({ success: false, error: "albumId and imageUrl required" }, { status: 400 });

    const photo = await prisma.galleryPhoto.create({ data: { albumId, imageUrl, caption, displayOrder: displayOrder || 0 } });
    return NextResponse.json({ success: true, data: photo }, { status: 201 });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("albumId") || "";
    if (!albumId) return NextResponse.json({ success: false, error: "albumId required" }, { status: 400 });

    const photos = await prisma.galleryPhoto.findMany({
        where: { albumId },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ success: true, data: photos });
}
