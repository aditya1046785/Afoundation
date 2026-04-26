import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { APP_URL } from "@/lib/constants";
export const dynamic = "force-dynamic";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Award, CreditCard, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReferralLinkCard } from "@/components/member/ReferralLinkCard";
import { Users } from "lucide-react";

export const metadata: Metadata = { title: "Member Dashboard | Nirashray Foundation" };

export default async function MemberDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const member = await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: {
            user: true,
            referredByMember: {
                include: {
                    user: { select: { name: true, email: true } },
                },
            },
            referredMembers: {
                include: {
                    user: { select: { name: true, email: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
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
    const donateLink = `${APP_URL}/donate?ref=${encodeURIComponent(member.memberId)}`;
    const registerLink = `${APP_URL}/register?ref=${encodeURIComponent(member.memberId)}`;
    const referralCount = member.referredMembers.length;

    return (
        <div className="space-y-8 max-w-5xl mx-auto relative z-10 pb-10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-200 h-200 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-150 h-150 bg-blue-300/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Welcome banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 sm:p-10 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-125 h-125 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                    <p className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-2">Welcome back,</p>
                    <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">{member.user.name}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <code className="bg-slate-800/80 px-3 py-1.5 rounded-lg text-slate-300 font-medium text-sm border border-slate-700">{member.memberId}</code>
                        <span className="text-slate-600 hidden sm:inline">•</span>
                        <Badge className={`${member.isApproved ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"} px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px] font-bold border`}>
                            {member.isApproved ? (
                                <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approved</>
                            ) : (
                                <><Clock className="w-3.5 h-3.5 mr-1.5" /> Pending Approval</>
                            )}
                        </Badge>
                    </div>
                    {!member.isApproved && (
                        <p className="text-slate-400 text-sm mt-4 font-medium max-w-md">
                            Your membership application is currently under review. We will notify you via email once it has been processed.
                        </p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: "Total Donated", value: formatCurrency(totalDonated._sum.amount || 0), icon: Heart, color: "text-rose-600 bg-rose-50 border-rose-100" },
                    { label: "Certificates", value: certCount, icon: Award, color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                    { label: "ID Card Status", value: activeIdCard ? "Active" : "Not Issued", icon: CreditCard, color: "text-blue-700 bg-blue-50 border-blue-100" },
                    { label: "Members Referred", value: referralCount, icon: Users, color: "text-violet-700 bg-violet-50 border-violet-100" },
                ].map((stat) => {
                    const Icon = stat.icon;
                    const [iconColor, bgColor, borderColor] = stat.color.split(" ");
                    return (
                        <Card key={stat.label} className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl ${bgColor} border ${borderColor} flex items-center justify-center shadow-inner`}>
                                        <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                                        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mt-1">{stat.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/20 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-100/50 bg-white/40">
                        <CardTitle className="text-[15px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
                            <Users className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                            My Referrer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-2">
                        {member.referredByMember ? (
                            <>
                                <p className="text-base font-bold text-slate-800">{member.referredByMember.user.name || "Unknown"}</p>
                                <p className="text-sm text-slate-500">{member.referredByMember.user.email || "-"}</p>
                                <code className="inline-block text-xs bg-slate-100 px-2 py-0.5 rounded mt-2">{member.referredByMember.memberId}</code>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">No member referral was used for your registration.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/20 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-100/50 bg-white/40">
                        <CardTitle className="text-[15px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
                            <Users className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                            Members You Referred
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100/60">
                            {member.referredMembers.length === 0 ? (
                                <p className="text-sm font-medium text-slate-400 text-center py-8">No member registrations yet via your referral.</p>
                            ) : (
                                member.referredMembers.map((referred) => (
                                    <div key={referred.id} className="flex items-center justify-between p-5 hover:bg-white/40 transition-colors">
                                        <div>
                                            <p className="text-[15px] font-bold text-slate-800">{referred.user.name}</p>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-wide">{referred.memberId} <span className="text-amber-500/50 mx-1">•</span> {referred.user.email}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1.5">
                                            <Badge
                                                variant="outline"
                                                className={referred.isApproved
                                                    ? "text-emerald-700 border-emerald-200 bg-emerald-50 rounded-lg px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-wider"
                                                    : "text-orange-700 border-orange-200 bg-orange-50 rounded-lg px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-wider"
                                                }
                                            >
                                                {referred.isApproved ? "Approved" : "Pending"}
                                            </Badge>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{formatDate(referred.createdAt)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReferralLinkCard
                    referralCode={member.memberId}
                    referralLink={donateLink}
                    title="Donation Referral Link"
                    subtitle="Donation Link"
                    note="Anyone using this link will land on the donation page and the payment will be tracked under your referral."
                    badgeLabel="Donation Code"
                />
                <ReferralLinkCard
                    referralCode={member.memberId}
                    referralLink={registerLink}
                    title="Member Registration Link"
                    subtitle="Member Invite"
                    note="Share this link to invite new members. Their registration will be automatically linked to you."
                    badgeLabel="Invite Code"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Donation History */}
                    {member.donations.length > 0 && (
                        <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/20 overflow-hidden">
                            <CardHeader className="pb-4 border-b border-slate-100/50 bg-white/40 flex-row items-center justify-between">
                                <CardTitle className="text-[15px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                                    Recent Donations
                                </CardTitle>
                                <Link href="/member/donations">
                                    <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-bold uppercase tracking-wider text-[10px] rounded-xl">View All</Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100/60">
                                    {member.donations.map((donation) => (
                                        <div key={donation.id} className="flex justify-between items-center p-5 hover:bg-white/40 transition-colors">
                                            <div>
                                                <p className="text-[15px] font-bold text-slate-800">{donation.purpose || "General Fund"}</p>
                                                <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-wide">{donation.receiptNumber} <span className="text-amber-500/50 mx-1">•</span> {donation.paidAt ? formatDate(donation.paidAt) : ""}</p>
                                            </div>
                                            <p className="text-lg font-bold text-emerald-600 tracking-tight">{formatCurrency(donation.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Certificates */}
                    {member.certificates.length > 0 && (
                        <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/20 overflow-hidden">
                            <CardHeader className="pb-4 border-b border-slate-100/50 bg-white/40 flex-row items-center justify-between">
                                <CardTitle className="text-[15px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
                                    <Award className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                                    My Certificates
                                </CardTitle>
                                <Link href="/member/certificates">
                                    <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-bold uppercase tracking-wider text-[10px] rounded-xl">View All</Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100/60">
                                    {member.certificates.map((cert) => (
                                        <div key={cert.id} className="flex justify-between items-center p-5 hover:bg-white/40 transition-colors">
                                            <div>
                                                <p className="text-[15px] font-bold text-slate-800">{cert.title}</p>
                                                <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-wide">{cert.certificateNo} <span className="text-amber-500/50 mx-1">•</span> {formatDate(cert.issueDate)}</p>
                                            </div>
                                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 rounded-lg px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-wider">{cert.type}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Quick links */}
                <div className="space-y-4">
                    <Link href={donateLink} className="block">
                        <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-[2rem] p-8 text-white cursor-pointer shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all hover:-translate-y-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                            <Heart className="w-10 h-10 text-white mb-4 relative z-10" strokeWidth={1.5} />
                            <p className="font-serif text-2xl font-bold mb-1 relative z-10">Donate Now</p>
                            <p className="text-sm text-amber-100 font-medium relative z-10">Support our mission</p>
                        </div>
                    </Link>
                    <Link href="/member/id-card" className="block">
                        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white cursor-pointer shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all hover:-translate-y-1 relative overflow-hidden group border border-slate-700">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                            <CreditCard className="w-10 h-10 text-amber-500 mb-4 relative z-10" strokeWidth={1.5} />
                            <p className="font-serif text-2xl font-bold mb-1 relative z-10">My ID Card</p>
                            <p className="text-sm text-slate-400 font-medium relative z-10">Download or view</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
