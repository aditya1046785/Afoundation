import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { id },
        include: { /* author info via authorId */ },
    });
    if (!post) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    // Increment view count
    await prisma.blogPost.update({ where: { id }, data: { views: { increment: 1 } } });
    return NextResponse.json({ success: true, data: post });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const validation = blogPostSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });

    const post = await prisma.blogPost.update({
        where: { id },
        data: {
            ...validation.data,
            publishedAt: validation.data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
        },
    });
    return NextResponse.json({ success: true, data: post });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Post deleted" });
}
