import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email")?.trim().toLowerCase();

        if (!email) {
            return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { position: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, position: null });
        }

        return NextResponse.json({ success: true, position: user.position });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch position" }, { status: 500 });
    }
}
