import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
    const afterId = searchParams.get("afterId"); // Message ID tie-breaker

    let messagesWhere: Prisma.ChatMessageWhereInput | undefined = undefined;
    if (after) {
        const afterDate = new Date(after);
        if (!isNaN(afterDate.getTime())) {
            if (afterId) {
                messagesWhere = {
                    OR: [
                        { createdAt: { gt: afterDate } },
                        {
                            createdAt: afterDate,
                            id: { gt: afterId },
                        },
                    ],
                };
            } else {
                messagesWhere = {
                    createdAt: { gt: afterDate },
                };
            }
        }
    }

    const liveSession = await prisma.chatSession.findFirst({
        where: { isLive: true },
        include: {
            messages: {
                where: messagesWhere,
                orderBy: [
                    { createdAt: "asc" },
                    { id: "asc" },
                ],
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

    const currentUser = session.user;

    if (currentUser.role === "MEMBER") {
        const member = await prisma.member.findUnique({
            where: { userId: currentUser.id },
            select: { isApproved: true },
        });

        if (!member?.isApproved) {
            return NextResponse.json({ success: false, error: "Member account is pending approval." }, { status: 403 });
        }
    }

    const body = await request.json();
    const { content, sessionId, clientId } = body;
    if (!content?.trim() || !sessionId) {
        return NextResponse.json({ success: false, error: "Missing content or sessionId" }, { status: 400 });
    }

    // Verify session is still live
    const chatSession = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!chatSession?.isLive) {
        return NextResponse.json({ success: false, error: "Chat session is not live." }, { status: 400 });
    }

    // Idempotent check: if clientId already exists for this session, return the existing message
    if (clientId && typeof clientId === "string") {
        const existing = await prisma.chatMessage.findFirst({
            where: {
                sessionId,
                clientId,
            },
        });
        if (existing) {
            return NextResponse.json({ success: true, data: existing });
        }
    }

    try {
        const message = await prisma.chatMessage.create({
            data: {
                sessionId,
                senderName: currentUser.name || "Unknown",
                senderRole: currentUser.role || "MEMBER",
                content: content.trim(),
                clientId: typeof clientId === "string" ? clientId : null,
            },
        });

        return NextResponse.json({ success: true, data: message });
    } catch (error: unknown) {
        const prismaError = error as { code?: string } | null;
        if (prismaError?.code === "P2002" && clientId) {
            const existing = await prisma.chatMessage.findFirst({
                where: {
                    sessionId,
                    clientId: typeof clientId === "string" ? clientId : undefined,
                },
            });
            if (existing) {
                return NextResponse.json({ success: true, data: existing });
            }
        }
        console.error("Error creating chat message:", error);
        return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
    }
}
