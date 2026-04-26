import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { APP_URL, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReferralLinkCard } from "@/components/member/ReferralLinkCard";
import { HandCoins, Heart, Link2, Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Referrals | Member Dashboard" };

export default async function MemberReferralsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const member = (await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: {
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
                take: 100,
            },
        },
    } as any)) as any;
    if (!member) redirect("/member/dashboard");

    const [selfDonations, referredDonations, selfAgg, referredAgg] = await Promise.all([
        prisma.donation.findMany({
            where: { memberId: member.id },
            orderBy: { createdAt: "desc" },
            take: 100,
        }),
        prisma.donation.findMany({
            where: { referrerMemberId: member.id },
            orderBy: { createdAt: "desc" },
            take: 100,
        }),
        prisma.donation.aggregate({
            where: { memberId: member.id, status: "COMPLETED" },
            _sum: { amount: true },
        }),
        prisma.donation.aggregate({
            where: { referrerMemberId: member.id, status: "COMPLETED" },
            _sum: { amount: true },
        }),
    ]);

    const referralLink = `${APP_URL}/donate?ref=${encodeURIComponent(member.memberId)}`;
    const registerLink = `${APP_URL}/register?ref=${encodeURIComponent(member.memberId)}`;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">My Referrals</h1>
                <p className="text-slate-500 text-sm mt-1">Track donations and member registrations connected to your referral links</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReferralLinkCard
                    referralCode={member.memberId}
                    referralLink={referralLink}
                    title="Donation Referral Link"
                    subtitle="Donation Link"
                    note="Anyone using this link will land directly on the donation page and the payment will be tracked under your referral."
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-violet-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{member.referredMembers.length}</p>
                            <p className="text-xs text-slate-500">Members Registered via You</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(selfAgg._sum.amount || 0)}</p>
                            <p className="text-xs text-slate-500">Your Own Completed Donations</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <HandCoins className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(referredAgg._sum.amount || 0)}</p>
                            <p className="text-xs text-slate-500">Completed Donations via Your Referral</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="px-5 pt-5 pb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-violet-700" />
                        <p className="text-sm font-semibold text-slate-800">Members Registered Through Your Link</p>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Member Name</TableHead>
                                    <TableHead className="text-xs font-semibold">Member Code</TableHead>
                                    <TableHead className="text-xs font-semibold">Email</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {member.referredMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-400 py-8">No member registrations yet via your referral. Share your registration link to start.</TableCell>
                                    </TableRow>
                                ) : (
                                    member.referredMembers.map((referred: any) => (
                                        <TableRow key={referred.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-800">{referred.user.name}</p>
                                                <p className="text-xs text-slate-400">Referred by you</p>
                                            </TableCell>
                                            <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{referred.memberId}</code></TableCell>
                                            <TableCell>
                                                <p className="text-sm text-slate-700">{referred.user.email}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs border ${referred.isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                                                    {referred.isApproved ? "Approved" : "Pending"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500">{formatDate(referred.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                    <p className="text-sm font-semibold text-slate-800">Your Referrer</p>
                    {member.referredByMember ? (
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-700">{member.referredByMember.user.name || "Unknown"}</p>
                                <p className="text-xs text-slate-400">{member.referredByMember.user.email || "-"}</p>
                            </div>
                            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{member.referredByMember.memberId}</code>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 mt-3">No referrer assigned to your registration.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Receipt #</TableHead>
                                    <TableHead className="text-xs font-semibold">Amount</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selfDonations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-400 py-8">No self donations found.</TableCell>
                                    </TableRow>
                                ) : (
                                    selfDonations.map((d) => (
                                        <TableRow key={d.id} className="hover:bg-slate-50">
                                            <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{d.receiptNumber}</code></TableCell>
                                            <TableCell className="font-bold text-sm">{formatCurrency(d.amount)}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs border ${d.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                                                    {PAYMENT_STATUS_LABELS[d.status as keyof typeof PAYMENT_STATUS_LABELS] || d.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500">{formatDate(d.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="px-5 pt-5 pb-2 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-emerald-700" />
                        <p className="text-sm font-semibold text-slate-800">Payments via Your Referral Link</p>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Receipt #</TableHead>
                                    <TableHead className="text-xs font-semibold">Donor</TableHead>
                                    <TableHead className="text-xs font-semibold">Amount</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referredDonations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-400 py-8">No referral donations yet. Share your link to start.</TableCell>
                                    </TableRow>
                                ) : (
                                    referredDonations.map((d) => (
                                        <TableRow key={d.id} className="hover:bg-slate-50">
                                            <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{d.receiptNumber}</code></TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-800">{d.donorName}</p>
                                                <p className="text-xs text-slate-400">{d.donorEmail}</p>
                                            </TableCell>
                                            <TableCell className="font-bold text-sm">{formatCurrency(d.amount)}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs border ${d.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                                                    {PAYMENT_STATUS_LABELS[d.status as keyof typeof PAYMENT_STATUS_LABELS] || d.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500">{formatDate(d.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
