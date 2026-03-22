import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — Admin dashboard statistics
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const [
        totalMembers,
        pendingApprovals,
        totalDonations,
        totalDonationAmount,
        completedDonations,
        totalCertificates,
        totalMessages,
        unreadMessages,
        upcomingEvents,
        recentMembers,
        recentDonations,
        membersByType,
        donationsByMonth,
    ] = await Promise.all([
        prisma.member.count({ where: { isApproved: true } }),
        prisma.member.count({ where: { isApproved: false } }),
        prisma.donation.count(),
        prisma.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
        prisma.donation.count({ where: { status: "COMPLETED" } }),
        prisma.certificate.count(),
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { isRead: false } }),
        prisma.event.count({ where: { date: { gte: new Date() }, isPublished: true } }),
        prisma.member.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } },
        }),
        prisma.donation.findMany({
            take: 5,
            where: { status: "COMPLETED" },
            orderBy: { paidAt: "desc" },
        }),
        prisma.member.groupBy({
            by: ["membershipType"],
            _count: { id: true },
        }),
        // Monthly donations for chart (last 6 months)
        prisma.$queryRaw`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "paidAt"), 'Mon YYYY') as month,
        SUM(amount)::float as total,
        COUNT(*)::int as count
      FROM "Donation"
      WHERE status = 'COMPLETED'
        AND "paidAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "paidAt")
      ORDER BY DATE_TRUNC('month', "paidAt") ASC
    `,
    ]);

    return NextResponse.json({
        success: true,
        data: {
            stats: {
                totalMembers,
                pendingApprovals,
                totalDonations: completedDonations,
                totalDonationAmount: totalDonationAmount._sum.amount || 0,
                totalCertificates,
                unreadMessages,
                upcomingEvents,
            },
            recentMembers,
            recentDonations,
            membersByType,
            donationsByMonth,
        },
    });
}
