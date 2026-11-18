import { Metadata } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Eye, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Messages | Admin Dashboard" };

interface MessageType {
    id: string; name: string; email: string; phone: string | null;
    subject: string; message: string; isRead: boolean; createdAt: Date;
}

export default async function AdminMessagesPage() {
    const messages: MessageType[] = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    }) as any;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-brand-neutral-900">Contact Messages</h1>
                <p className="text-brand-neutral-500 text-sm mt-1">Messages from the website contact form</p>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-brand-neutral-50">
                                    <TableHead className="text-xs font-semibold">Sender</TableHead>
                                    <TableHead className="text-xs font-semibold">Subject</TableHead>
                                    <TableHead className="text-xs font-semibold">Message</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-brand-neutral-400 py-10">No messages yet</TableCell>
                                    </TableRow>
                                ) : (
                                    messages.map((msg) => (
                                        <TableRow key={msg.id} className={`hover:bg-brand-neutral-50 ${!msg.isRead ? "bg-blue-50/50" : ""}`}>
                                            <TableCell>
                                                <p className="text-sm font-medium text-brand-neutral-800">{msg.name}</p>
                                                <p className="text-xs text-brand-neutral-400">{msg.email}</p>
                                                {msg.phone && <p className="text-xs text-brand-neutral-400">{msg.phone}</p>}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-brand-neutral-700">{msg.subject}</TableCell>
                                            <TableCell className="text-sm text-brand-neutral-500 max-w-xs truncate">{msg.message}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs border ${msg.isRead ? "bg-brand-neutral-50 text-brand-neutral-500 border-brand-neutral-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                                    {msg.isRead ? "Read" : "New"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-brand-neutral-500">{formatDate(msg.createdAt)}</TableCell>
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
