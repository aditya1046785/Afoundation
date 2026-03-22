import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: {
            user: { select: { name: true, email: true, image: true } },
            idCards: { where: { isActive: true }, take: 1 },
        },
    });

    if (!member) {
        return NextResponse.json({ success: false, error: "Member profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
}
