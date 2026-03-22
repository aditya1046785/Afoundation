import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CERTIFICATE_LABELS } from "@/lib/constants";
import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Certificates | Member Dashboard" };

export default async function MemberCertificatesPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const member = await prisma.member.findFirst({ where: { userId: session.user.id } });
    if (!member) redirect("/member/dashboard");

    const certs = await prisma.certificate.findMany({
        where: { memberId: member.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">My Certificates</h1>
                    <p className="text-slate-500 text-sm mt-1">All certificates issued to you</p>
                </div>
                <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900">{certs.length}</span>
                    <span className="text-xs text-slate-500">certificates</span>
                </div>
            </div>

            {certs.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="py-20 text-center">
                        <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">No certificates issued yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certs.map((cert) => (
                        <Card key={cert.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                            <Award className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">{cert.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{cert.certificateNo}</p>
                                            {cert.description && <p className="text-xs text-slate-500 mt-1">{cert.description}</p>}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs shrink-0">
                                        {CERTIFICATE_LABELS[cert.type as keyof typeof CERTIFICATE_LABELS] || cert.type}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                    <div className="text-xs text-slate-400">
                                        <span>Issued: {formatDate(cert.issueDate)}</span>
                                        {cert.issuedBy && <span className="ml-2">by {cert.issuedBy}</span>}
                                    </div>
                                    {cert.pdfUrl && (
                                        <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 text-xs">
                                                <Download className="w-3 h-3 mr-1" /> Download
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
