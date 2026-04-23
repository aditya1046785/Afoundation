import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const profileImageSchema = z.object({
    image: z.string().trim().url("Please provide a valid image URL").or(z.literal("")),
});

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: {
            user: { select: { name: true, email: true, image: true, phone: true } },
            idCards: { where: { isActive: true }, take: 1 },
        },
    });

    if (!member) {
        return NextResponse.json({ success: false, error: "Member profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
}

export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findFirst({
        where: { userId: session.user.id },
        select: { id: true },
    });

    if (!member) {
        return NextResponse.json({ success: false, error: "Member profile not found" }, { status: 404 });
    }

    try {
        const body = await request.json();
        const validation = profileImageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.issues[0]?.message || "Invalid data" }, { status: 400 });
        }

        const image = validation.data.image || null;

        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: { image },
            }),
            prisma.member.update({
                where: { userId: session.user.id },
                data: { photo: image },
            }),
        ]);

        return NextResponse.json({ success: true, message: "Profile photo updated", data: { image } });
    } catch (error) {
        console.error("Error updating member image:", error);
        return NextResponse.json({ success: false, error: "Failed to update profile photo" }, { status: 500 });
    }
}
