import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const adminMode = searchParams.get("admin") === "true";

    const where: Record<string, unknown> = {};
    if (!adminMode) where.status = "PUBLISHED";
    else if (status) where.status = status;
    if (category) where.category = category;

    const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
            where,
            select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, category: true, tags: true, status: true, publishedAt: true, views: true, createdAt: true, authorId: true },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { publishedAt: "desc" },
        }),
        prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const validation = blogPostSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

    const existing = await prisma.blogPost.findUnique({ where: { slug: validation.data.slug } });
    if (existing) return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });

    const post = await prisma.blogPost.create({
        data: {
            ...validation.data,
            authorId: session.user.id,
            publishedAt: validation.data.status === "PUBLISHED" ? new Date() : null,
        },
    });
    return NextResponse.json({ success: true, data: post }, { status: 201 });
}
