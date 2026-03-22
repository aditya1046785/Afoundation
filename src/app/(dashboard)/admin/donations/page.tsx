import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, IndianRupee, TrendingUp } from "lucide-react";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Donations | Admin Dashboard" };

interface DonationType {
    id: string; receiptNumber: string; donorName: string; donorEmail: string;
    amount: number; purpose: string | null; status: string; createdAt: Date;
}

export default async function AdminDonationsPage() {
    const [donationsRaw, totalAgg, completedCount] = await Promise.all([
        prisma.donation.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { member: { include: { user: { select: { name: true } } } } },
        }),
        prisma.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
        prisma.donation.count({ where: { status: "COMPLETED" } }),
    ]);
    const donations = donationsRaw as unknown as DonationType[];
    const totalAmount = (totalAgg as any)?._sum?.amount || 0;

    const statusColors: Record<string, string> = {
        COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        PENDING: "bg-orange-50 text-orange-700 border-orange-200",
        FAILED: "bg-red-50 text-red-700 border-red-200",
        REFUNDED: "bg-slate-50 text-slate-700 border-slate-200",
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">Donations</h1>
                <p className="text-slate-500 text-sm mt-1">Track and manage all donations</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                            <IndianRupee className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
                            <p className="text-xs text-slate-500">Total Collected</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                            <p className="text-xs text-slate-500">Successful Donations</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-blue-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{donations.length}</p>
                            <p className="text-xs text-slate-500">Total Records</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Receipt #</TableHead>
                                    <TableHead className="text-xs font-semibold">Donor</TableHead>
                                    <TableHead className="text-xs font-semibold">Amount</TableHead>
                                    <TableHead className="text-xs font-semibold">Purpose</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.map((d) => (
                                    <TableRow key={d.id} className="hover:bg-slate-50">
                                        <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{d.receiptNumber}</code></TableCell>
                                        <TableCell>
                                            <p className="text-sm font-medium text-slate-800">{d.donorName}</p>
                                            <p className="text-xs text-slate-400">{d.donorEmail}</p>
                                        </TableCell>
                                        <TableCell className="font-bold text-sm">{formatCurrency(d.amount)}</TableCell>
                                        <TableCell className="text-sm text-slate-500">{d.purpose || "General"}</TableCell>
                                        <TableCell>
                                            <Badge className={`text-xs border ${statusColors[d.status] || ""}`}>
                                                {PAYMENT_STATUS_LABELS[d.status as keyof typeof PAYMENT_STATUS_LABELS] || d.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">{formatDate(d.createdAt)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
