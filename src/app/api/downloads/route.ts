import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { downloadDocumentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const adminMode = searchParams.get("admin") === "true";
    const where: Record<string, unknown> = {};
    if (!adminMode) where.isVisible = true;
    if (category) where.category = category;

    const docs = await prisma.downloadDocument.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: docs });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const validation = downloadDocumentSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });
    const doc = await prisma.downloadDocument.create({ data: validation.data });
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
}
