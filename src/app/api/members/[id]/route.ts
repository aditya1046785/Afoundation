import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { memberSchema } from "@/lib/validations";

// GET — Get a single member by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Members can only access their own data
    if (session.user.role === "MEMBER") {
        const member = await prisma.member.findFirst({ where: { id, userId: session.user.id }, include: { user: { select: { name: true, email: true, phone: true } } } });
        if (!member) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: member });
    }

    if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const member = await prisma.member.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true, position: true, role: true, isActive: true, createdAt: true } },
            donations: { orderBy: { createdAt: "desc" } },
            certificates: { orderBy: { createdAt: "desc" } },
            idCards: { orderBy: { createdAt: "desc" } },
        },
    });

    if (!member) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: member });
}

// PUT — Update member
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Members can only update their own non-sensitive data
    if (session.user.role === "MEMBER") {
        const member = await prisma.member.findFirst({ where: { id, userId: session.user.id } });
        if (!member) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

        const { fatherName, dateOfBirth, gender, address, city, state, pincode, occupation, photo } = body;
        const updatedMember = await prisma.member.update({
            where: { id },
            data: { fatherName, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, gender, address, city, state, pincode, occupation, photo },
        });

        // Also update name and phone in user table
        if (body.name || body.phone) {
            await prisma.user.update({ where: { id: session.user.id }, data: { name: body.name, phone: body.phone } });
        }

        return NextResponse.json({ success: true, data: updatedMember });
    }

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    try {
        const validation = memberSchema.partial().safeParse(body);
        if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

        const member = await prisma.member.findUnique({ where: { id }, include: { user: true } });
        if (!member) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });

        const { name, phone, position, fatherName, dateOfBirth, gender, address, city, state, pincode, aadharNumber, occupation, membershipType, photo } = validation.data;

        await prisma.$transaction([
            prisma.member.update({
                where: { id },
                data: { fatherName, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, gender, address, city, state, pincode, aadharNumber, occupation, membershipType: membershipType as "GENERAL" | "LIFETIME" | "HONORARY" | "STUDENT" | undefined, photo },
            }),
            prisma.user.update({ where: { id: member.userId }, data: { name, phone, position } }),
        ]);

        return NextResponse.json({ success: true, message: "Member updated successfully" });
    } catch (error) {
        console.error("Update member error:", error);
        return NextResponse.json({ success: false, error: "Failed to update member." }, { status: 500 });
    }
}

// DELETE — Soft delete (deactivate) member
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isPermanentDelete = searchParams.get("permanent") === "true";

    const member = await prisma.member.findUnique({
        where: { id },
        include: { user: { select: { role: true } } },
    });
    if (!member) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });

    if (["SUPER_ADMIN", "ADMIN"].includes(member.user.role)) {
        return NextResponse.json(
            { success: false, error: "Protected account cannot be deleted." },
            { status: 403 }
        );
    }

    if (isPermanentDelete) {
        await prisma.$transaction(async (tx) => {
            // Keep donation history while unlinking from the member being deleted.
            await tx.donation.updateMany({ where: { memberId: id }, data: { memberId: null } });
            await tx.member.delete({ where: { id } });
            await tx.user.delete({ where: { id: member.userId } });
        });

        return NextResponse.json({ success: true, message: "Member deleted permanently" });
    }

    // Soft delete — deactivate user
    await prisma.user.update({ where: { id: member.userId }, data: { isActive: false } });
    return NextResponse.json({ success: true, message: "Member deactivated successfully" });
}
