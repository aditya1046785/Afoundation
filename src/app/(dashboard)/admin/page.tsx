import { Metadata } from "next";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Award, MessageSquare, Clock, TrendingUp, UserCheck, Calendar } from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard | Nirashray Foundation" };

interface RecentMember {
    id: string; memberId: string; membershipType: string;
    isApproved: boolean; createdAt: Date;
    user: { name: string | null; email: string | null };
}
interface RecentDonation {
    id: string; donorName: string; amount: number;
    receiptNumber: string; paidAt: Date | null;
}

async function getStats() {
    const [
        totalMembers, pendingApprovals, totalDonationAgg, totalCertificates,
        unreadMessages, upcomingEvents, recentMembers, recentDonations,
    ] = await Promise.all([
        prisma.member.count({ where: { isApproved: true } }),
        prisma.member.count({ where: { isApproved: false } }),
        prisma.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
        prisma.certificate.count(),
        prisma.contactMessage.count({ where: { isRead: false } }),
        prisma.event.count({ where: { date: { gte: new Date() }, isPublished: true } }),
        prisma.member.findMany({
            take: 5, orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } },
        }),
        prisma.donation.findMany({
            take: 5, where: { status: "COMPLETED" }, orderBy: { paidAt: "desc" },
        }),
    ]);
    return {
        totalMembers, pendingApprovals,
        totalDonations: (totalDonationAgg as any)?._sum?.amount || 0,
        totalCertificates, unreadMessages, upcomingEvents,
        recentMembers: recentMembers as unknown as RecentMember[],
        recentDonations: recentDonations as unknown as RecentDonation[],
    };
}

export default async function AdminDashboardPage() {
    const stats = await getStats();

    const statCards = [
        { title: "Active Members", value: stats.totalMembers, icon: Users, color: "text-blue-700", bg: "bg-blue-50" },
        { title: "Total Donations", value: formatCurrency(stats.totalDonations), icon: Heart, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Certificates Issued", value: stats.totalCertificates, icon: Award, color: "text-emerald-700", bg: "bg-emerald-50" },
        { title: "Unread Messages", value: stats.unreadMessages, icon: MessageSquare, color: "text-rose-600", bg: "bg-rose-50" },
        { title: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", urgent: stats.pendingApprovals > 0 },
        { title: "Upcoming Events", value: stats.upcomingEvents, icon: Calendar, color: "text-purple-700", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
                </div>
                {stats.pendingApprovals > 0 && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 animate-pulse">
                        {stats.pendingApprovals} pending approval{stats.pendingApprovals !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.title} className={`border-0 shadow-sm ${(card as any).urgent ? "ring-2 ring-orange-200" : ""}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-6 h-6 ${card.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                                        <p className="text-xs text-slate-500">{card.title}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Members */}
                <Card className="shadow-sm border-0">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-700" />
                            Recent Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recentMembers.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">No members yet</p>
                            ) : (
                                stats.recentMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{member.user.name}</p>
                                            <p className="text-xs text-slate-400">{member.memberId} · {member.membershipType}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant="outline"
                                                className={member.isApproved
                                                    ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                                                    : "text-orange-700 border-orange-200 bg-orange-50"
                                                }
                                            >
                                                {member.isApproved ? "Approved" : "Pending"}
                                            </Badge>
                                            <p className="text-xs text-slate-400 mt-1">{formatDate(member.createdAt)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Donations */}
                <Card className="shadow-sm border-0">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                            Recent Donations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.recentDonations.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">No donations yet</p>
                            ) : (
                                stats.recentDonations.map((donation) => (
                                    <div key={donation.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{donation.donorName}</p>
                                            <p className="text-xs text-slate-400">{donation.receiptNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-700">{formatCurrency(donation.amount)}</p>
                                            <p className="text-xs text-slate-400">{donation.paidAt ? formatDate(donation.paidAt) : ""}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
