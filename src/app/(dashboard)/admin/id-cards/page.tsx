import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard } from "lucide-react";

export const metadata: Metadata = { title: "ID Cards | Admin Dashboard" };

export default async function AdminIDCardsPage() {
    const idCards = await prisma.iDCard.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { member: { include: { user: { select: { name: true, email: true } } } } },
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">Member ID Cards</h1>
                <p className="text-slate-500 text-sm mt-1">View and manage issued ID cards</p>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Card #</TableHead>
                                    <TableHead className="text-xs font-semibold">Member</TableHead>
                                    <TableHead className="text-xs font-semibold">Valid Until</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Issued</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {idCards.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-400 py-10">
                                            <CreditCard className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            No ID cards issued yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    idCards.map((card: any) => (
                                        <TableRow key={card.id} className="hover:bg-slate-50">
                                            <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{card.cardNumber}</code></TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-800">{card.member?.user?.name || "N/A"}</p>
                                                <p className="text-xs text-slate-400">{card.member?.user?.email || ""}</p>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">{formatDate(card.expiryDate)}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs border ${card.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                                    {card.isActive ? "Active" : "Expired"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500">{formatDate(card.createdAt)}</TableCell>
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
