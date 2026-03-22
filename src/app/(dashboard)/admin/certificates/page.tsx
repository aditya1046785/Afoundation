import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Certificates | Admin Dashboard" };

interface CertType {
    id: string; certificateNo: string; title: string; type: string;
    issueDate: Date; member?: { user?: { name: string | null } } | null;
}

export default async function AdminCertificatesPage() {
    const certs: CertType[] = await prisma.certificate.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { member: { include: { user: { select: { name: true } } } } },
    }) as any;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">Certificates</h1>
                <p className="text-slate-500 text-sm mt-1">Issue and manage certificates for members</p>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Certificate #</TableHead>
                                    <TableHead className="text-xs font-semibold">Member</TableHead>
                                    <TableHead className="text-xs font-semibold">Title</TableHead>
                                    <TableHead className="text-xs font-semibold">Type</TableHead>
                                    <TableHead className="text-xs font-semibold">Issued</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {certs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-400 py-10">No certificates issued yet</TableCell>
                                    </TableRow>
                                ) : (
                                    certs.map((cert) => (
                                        <TableRow key={cert.id} className="hover:bg-slate-50">
                                            <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{cert.certificateNo}</code></TableCell>
                                            <TableCell className="text-sm font-medium text-slate-800">{cert.member?.user?.name || "N/A"}</TableCell>
                                            <TableCell className="text-sm text-slate-700">{cert.title}</TableCell>
                                            <TableCell><Badge variant="outline" className="text-xs">{cert.type}</Badge></TableCell>
                                            <TableCell className="text-xs text-slate-500">{formatDate(cert.issueDate)}</TableCell>
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
