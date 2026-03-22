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
    const doc = await prisma.downloadDocument.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, data: doc });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.downloadDocument.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Document deleted" });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Increment download count (public)
    const doc = await prisma.downloadDocument.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
    });
    return NextResponse.json({ success: true, data: doc });
}
