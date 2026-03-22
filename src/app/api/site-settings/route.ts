import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { bulkUpdateSiteSettings } from "@/lib/site-settings";

// GET — Get all site settings (or specific keys)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keys = searchParams.get("keys");
    const prefix = searchParams.get("prefix");

    let settings;
    if (keys) {
        const keyList = keys.split(",");
        settings = await prisma.siteSettings.findMany({ where: { key: { in: keyList } } });
    } else if (prefix) {
        settings = await prisma.siteSettings.findMany({ where: { key: { startsWith: prefix } } });
    } else {
        settings = await prisma.siteSettings.findMany({ orderBy: { key: "asc" } });
    }

    const result = settings.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
        acc[s.key] = s.value;
        return acc;
    }, {});

    return NextResponse.json({ success: true, data: result });
}

// PUT — Bulk update site settings (admin only)
export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
    }

    await bulkUpdateSiteSettings(body);
    return NextResponse.json({ success: true, message: "Settings updated successfully" });
}

// POST — Also accepts POST for settings updates (used by CMS editors)
export async function POST(request: NextRequest) {
    return PUT(request);
}
