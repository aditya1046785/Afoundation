import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { teamMemberSchema } from "@/lib/validations";

// GET — List team members (public)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const adminMode = searchParams.get("admin") === "true";

    const where: Record<string, unknown> = {};
    if (!adminMode) where.isVisible = true;
    if (category) where.category = category;

    const teamMembers = await prisma.teamMember.findMany({
        where,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ success: true, data: teamMembers });
}

// POST — Create team member (admin only)
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validation = teamMemberSchema.safeParse(body);
        if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

        const member = await prisma.teamMember.create({ data: validation.data });
        return NextResponse.json({ success: true, data: member }, { status: 201 });
    } catch (error) {
        console.error("Create team member error:", error);
        return NextResponse.json({ success: false, error: "Failed to create team member." }, { status: 500 });
    }
}
