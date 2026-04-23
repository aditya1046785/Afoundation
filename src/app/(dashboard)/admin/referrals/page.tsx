import { Metadata } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HandCoins, Link2, Users } from "lucide-react";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Referral Donations | Admin Dashboard" };

export default async function AdminReferralsPage() {
    const [grouped, details] = await Promise.all([
        prisma.donation.groupBy({
            by: ["referrerMemberId"],
            where: { referrerMemberId: { not: null }, status: "COMPLETED" },
            _sum: { amount: true },
            _count: { _all: true },
            orderBy: { _sum: { amount: "desc" } },
        }),
        prisma.donation.findMany({
            where: { referrerMemberId: { not: null } },
            orderBy: { createdAt: "desc" },
            take: 200,
            include: {
                referrerMember: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
            },
        }),
    ]);

    const referrerIds = grouped
        .map((row) => row.referrerMemberId)
        .filter((id): id is string => Boolean(id));

    const referrers = referrerIds.length
        ? await prisma.member.findMany({
            where: { id: { in: referrerIds } },
            include: { user: { select: { name: true, email: true } } },
        })
        : [];

    const referrerMap = new Map(referrers.map((member) => [member.id, member]));
    const totalReferredAmount = grouped.reduce((sum, row) => sum + (row._sum.amount || 0), 0);
    const totalReferredPayments = grouped.reduce((sum, row) => sum + row._count._all, 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">Referral Donations</h1>
                <p className="text-slate-500 text-sm mt-1">See who referred whom and how much donation came through each member</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <HandCoins className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalReferredAmount)}</p>
                            <p className="text-xs text-slate-500">Completed Referral Amount</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Link2 className="w-6 h-6 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{totalReferredPayments}</p>
                            <p className="text-xs text-slate-500">Completed Referral Payments</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-amber-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{grouped.length}</p>
                            <p className="text-xs text-slate-500">Members With Successful Referrals</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Referrer Member</TableHead>
                                    <TableHead className="text-xs font-semibold">Member Code</TableHead>
                                    <TableHead className="text-xs font-semibold">Completed Payments</TableHead>
                                    <TableHead className="text-xs font-semibold">Total Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {grouped.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-400 py-8">No completed referral donations yet.</TableCell>
                                    </TableRow>
                                ) : (
                                    grouped.map((row) => {
                                        const member = row.referrerMemberId ? referrerMap.get(row.referrerMemberId) : null;
                                        return (
                                            <TableRow key={row.referrerMemberId || "unknown"} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <p className="text-sm font-medium text-slate-800">{member?.user.name || "Unknown"}</p>
                                                    <p className="text-xs text-slate-400">{member?.user.email || "-"}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{member?.memberId || "-"}</code>
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold text-slate-800">{row._count._all}</TableCell>
                                                <TableCell className="text-sm font-bold text-emerald-700">{formatCurrency(row._sum.amount || 0)}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Receipt #</TableHead>
                                    <TableHead className="text-xs font-semibold">Referrer</TableHead>
                                    <TableHead className="text-xs font-semibold">Donor</TableHead>
                                    <TableHead className="text-xs font-semibold">Amount</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {details.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-400 py-8">No referral payment records found.</TableCell>
                                    </TableRow>
                                ) : (
                                    details.map((row) => (
                                        <TableRow key={row.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{row.receiptNumber}</code>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-800">{row.referrerMember?.user.name || "Unknown"}</p>
                                                <p className="text-xs text-slate-400">{row.referrerMember?.memberId || "-"}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-800">{row.donorName}</p>
                                                <p className="text-xs text-slate-400">{row.donorEmail}</p>
                                            </TableCell>
                                            <TableCell className="font-bold text-sm">{formatCurrency(row.amount)}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs border ${row.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                                                    {PAYMENT_STATUS_LABELS[row.status as keyof typeof PAYMENT_STATUS_LABELS] || row.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500">{formatDate(row.createdAt)}</TableCell>
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
