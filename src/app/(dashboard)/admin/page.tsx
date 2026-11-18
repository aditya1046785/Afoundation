import { Metadata } from "next";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
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
        <div className="space-y-8 max-w-7xl mx-auto relative z-10 pb-10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-sm">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-brand-neutral-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-brand-neutral-500 font-medium text-sm mt-2 flex items-center gap-2">
                        Welcome back to the Nirashray Workspace.
                    </p>
                </div>
                {stats.pendingApprovals > 0 && (
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200/60 shadow-sm px-4 py-1.5 animate-pulse rounded-xl text-xs tracking-wide uppercase font-bold">
                        {stats.pendingApprovals} pending approval{stats.pendingApprovals !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.title} className={`bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-brand-neutral-200/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${(card as any).urgent ? "ring-2 ring-orange-200/50" : ""}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center shrink-0 border border-white/60 shadow-inner`}>
                                        <Icon className={`w-6 h-6 ${card.color}`} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-brand-neutral-800 tracking-tight">{card.value}</p>
                                        <p className="text-[11px] uppercase tracking-widest font-bold text-brand-neutral-400 mt-1">{card.title}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Members */}
                <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-brand-neutral-200/20 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-brand-neutral-100/50 bg-white/40">
                        <CardTitle className="text-[15px] font-bold text-brand-neutral-800 uppercase tracking-widest flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                            Recent Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-brand-neutral-100/60">
                            {stats.recentMembers.length === 0 ? (
                                <p className="text-sm font-medium text-brand-neutral-400 text-center py-8">No members yet</p>
                            ) : (
                                stats.recentMembers.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-5 hover:bg-white/40 transition-colors">
                                        <div>
                                            <p className="text-[15px] font-bold text-brand-neutral-800">{member.user.name}</p>
                                            <p className="text-xs font-medium text-brand-neutral-400 mt-0.5 tracking-wide">{member.memberId} <span className="text-amber-500/50 mx-1">•</span> {member.membershipType}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1.5">
                                            <Badge
                                                variant="outline"
                                                className={member.isApproved
                                                    ? "text-emerald-700 border-emerald-200 bg-emerald-50 rounded-lg px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-wider"
                                                    : "text-orange-700 border-orange-200 bg-orange-50 rounded-lg px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-wider"
                                                }
                                            >
                                                {member.isApproved ? "Approved" : "Pending"}
                                            </Badge>
                                            <p className="text-[10px] font-bold text-brand-neutral-300 uppercase tracking-widest">{formatDate(member.createdAt)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Donations */}
                <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-brand-neutral-200/20 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-brand-neutral-100/50 bg-white/40">
                        <CardTitle className="text-[15px] font-bold text-brand-neutral-800 uppercase tracking-widest flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                            Recent Donations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-brand-neutral-100/60">
                            {stats.recentDonations.length === 0 ? (
                                <p className="text-sm font-medium text-brand-neutral-400 text-center py-8">No donations yet</p>
                            ) : (
                                stats.recentDonations.map((donation) => (
                                    <div key={donation.id} className="flex items-center justify-between p-5 hover:bg-white/40 transition-colors">
                                        <div>
                                            <p className="text-[15px] font-bold text-brand-neutral-800">{donation.donorName}</p>
                                            <p className="text-xs font-medium text-brand-neutral-400 mt-0.5 tracking-wide">{donation.receiptNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-emerald-600 tracking-tight">{formatCurrency(donation.amount)}</p>
                                            <p className="text-[10px] font-bold text-brand-neutral-300 uppercase tracking-widest mt-0.5">{donation.paidAt ? formatDate(donation.paidAt) : ""}</p>
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
