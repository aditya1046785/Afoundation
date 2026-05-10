import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // recent completed donations
    const recentDonations = await prisma.donation.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { paidAt: 'desc' },
      take: 12,
      select: {
        id: true,
        donorName: true,
        amount: true,
        message: true,
        purpose: true,
        paidAt: true,
      },
    });

    // total raised
    const totalAgg = await prisma.donation.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    // unique supporters (by email)
    const unique = await prisma.donation.groupBy({
      by: ['donorEmail'],
      where: { status: 'COMPLETED' },
    });

    // approved members count
    const approvedMembers = await prisma.member.count({ where: { isApproved: true } });

    return NextResponse.json({
      success: true,
      recentDonations,
      totalRaised: totalAgg._sum.amount ?? 0,
      uniqueSupporters: unique.length,
      approvedMembers,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
