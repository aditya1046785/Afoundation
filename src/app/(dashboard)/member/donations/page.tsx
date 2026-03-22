import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "My Donations | Member Dashboard" };

export default async function MemberDonationsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const member = await prisma.member.findFirst({ where: { userId: session.user.id } });
    if (!member) redirect("/member/dashboard");

    const donations = await prisma.donation.findMany({
        where: { memberId: member.id },
        orderBy: { createdAt: "desc" },
    });

    const totalDonated = await prisma.donation.aggregate({
        where: { memberId: member.id, status: "COMPLETED" },
        _sum: { amount: true },
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">My Donations</h1>
                    <p className="text-slate-500 text-sm mt-1">Your complete donation history</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalDonated._sum.amount || 0)}</p>
                    <p className="text-xs text-slate-500">Total Donated</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Receipt #</TableHead>
                                    <TableHead className="text-xs font-semibold">Amount</TableHead>
                                    <TableHead className="text-xs font-semibold">Purpose</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-400 py-10">No donations yet. Make your first donation today!</TableCell>
                                    </TableRow>
                                ) : (
                                    donations.map((d) => (
                                        <TableRow key={d.id} className="hover:bg-slate-50">
                                            <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{d.receiptNumber}</code></TableCell>
                                            <TableCell className="font-bold text-sm">{formatCurrency(d.amount)}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{d.purpose || "General Fund"}</TableCell>
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
