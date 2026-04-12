import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — get current live session + messages
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "MEMBER") {
        const member = await prisma.member.findUnique({
            where: { userId: session.user.id },
            select: { isApproved: true },
        });

        if (!member?.isApproved) {
            return NextResponse.json({ success: false, error: "Member account is pending approval." }, { status: 403 });
        }
    }

    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after"); // ISO timestamp for polling

    const liveSession = await prisma.chatSession.findFirst({
        where: { isLive: true },
        include: {
            messages: {
                where: after ? { createdAt: { gt: new Date(after) } } : undefined,
                orderBy: { createdAt: "asc" },
                take: 100,
            },
        },
    });

    return NextResponse.json({ success: true, data: liveSession });
}

// POST — send a message
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "MEMBER") {
        const member = await prisma.member.findUnique({
            where: { userId: session.user.id },
            select: { isApproved: true },
        });

        if (!member?.isApproved) {
            return NextResponse.json({ success: false, error: "Member account is pending approval." }, { status: 403 });
        }
    }

    const { content, sessionId } = await request.json();
    if (!content?.trim() || !sessionId) {
        return NextResponse.json({ success: false, error: "Missing content or sessionId" }, { status: 400 });
    }

    // Verify session is still live
    const chatSession = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!chatSession?.isLive) {
        return NextResponse.json({ success: false, error: "Chat session is not live." }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
        data: {
            sessionId,
            senderName: session.user.name || "Unknown",
            senderRole: session.user.role || "MEMBER",
            content: content.trim(),
        },
    });

    return NextResponse.json({ success: true, data: message });
}
