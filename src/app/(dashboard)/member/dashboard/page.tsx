import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Award, CreditCard, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Member Dashboard | Nirashray Foundation" };

export default async function MemberDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const member = await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: {
            user: true,
            donations: { where: { status: "COMPLETED" }, orderBy: { paidAt: "desc" }, take: 3 },
            certificates: { orderBy: { createdAt: "desc" }, take: 3 },
        },
    });

    if (!member) {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <h1 className="font-serif text-2xl font-bold text-slate-900 mb-3">No Membership Found</h1>
                <p className="text-slate-500 mb-6">Your account doesn&apos;t have a member profile yet.</p>
                <Link href="/"><Button>Go to Homepage</Button></Link>
            </div>
        );
    }

    const totalDonated = await prisma.donation.aggregate({
        where: { memberId: member.id, status: "COMPLETED" },
        _sum: { amount: true },
    });

    const certCount = await prisma.certificate.count({ where: { memberId: member.id } });
    const activeIdCard = await prisma.iDCard.findFirst({ where: { memberId: member.id, isActive: true } });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-2xl p-6 text-white">
                <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
                <h1 className="font-serif text-2xl font-bold">{member.user.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                    <code className="text-blue-200 text-sm">{member.memberId}</code>
                    <span className="text-blue-300">·</span>
                    <Badge className={`${member.isApproved ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/30" : "bg-orange-500/20 text-orange-200 border-orange-500/30"} border text-xs`}>
                        {member.isApproved ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                        ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Pending Approval</>
                        )}
                    </Badge>
                </div>
                {!member.isApproved && (
                    <p className="text-blue-200 text-xs mt-2">
                        Your membership is under review. You&apos;ll receive an email once approved.
                    </p>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Donated", value: formatCurrency(totalDonated._sum.amount || 0), icon: Heart, color: "text-rose-600 bg-rose-50" },
                    { label: "Certificates", value: certCount, icon: Award, color: "text-emerald-700 bg-emerald-50" },
                    { label: "ID Card", value: activeIdCard ? "Active" : "Not Issued", icon: CreditCard, color: "text-blue-700 bg-blue-50" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    const [iconColor, bgColor] = stat.color.split(" ");
                    return (
                        <Card key={stat.label} className="shadow-sm border-0">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Donation History */}
            {member.donations.length > 0 && (
                <Card className="shadow-sm border-0">
                    <CardHeader className="pb-3 flex-row items-center justify-between">
                        <CardTitle className="text-base">Recent Donations</CardTitle>
                        <Link href="/member/donations"><Button variant="ghost" size="sm" className="text-blue-700">View All</Button></Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {member.donations.map((donation) => (
                                <div key={donation.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{donation.purpose || "General Fund"}</p>
                                        <p className="text-xs text-slate-400">{donation.receiptNumber} · {donation.paidAt ? formatDate(donation.paidAt) : ""}</p>
                                    </div>
                                    <p className="font-bold text-emerald-700 text-sm">{formatCurrency(donation.amount)}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Certificates */}
            {member.certificates.length > 0 && (
                <Card className="shadow-sm border-0">
                    <CardHeader className="pb-3 flex-row items-center justify-between">
                        <CardTitle className="text-base">My Certificates</CardTitle>
                        <Link href="/member/certificates"><Button variant="ghost" size="sm" className="text-blue-700">View All</Button></Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {member.certificates.map((cert) => (
                                <div key={cert.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{cert.title}</p>
                                        <p className="text-xs text-slate-400">{cert.certificateNo} · {formatDate(cert.issueDate)}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">{cert.type}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/donate">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg transition-shadow">
                        <Heart className="w-8 h-8 fill-white mb-2" />
                        <p className="font-semibold">Donate Now</p>
                        <p className="text-xs text-amber-200 mt-0.5">Support our mission</p>
                    </div>
                </Link>
                <Link href="/member/id-card">
                    <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg transition-shadow">
                        <CreditCard className="w-8 h-8 mb-2" />
                        <p className="font-semibold">My ID Card</p>
                        <p className="text-xs text-blue-200 mt-0.5">Download or view</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
