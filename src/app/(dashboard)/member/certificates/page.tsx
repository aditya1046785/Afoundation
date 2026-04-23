import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CERTIFICATE_LABELS } from "@/lib/constants";
import { Award, CheckCircle2, Shield } from "lucide-react";
import { CertificateDownloadButton } from "@/components/member/CertificateDownloadButton";

export const metadata: Metadata = { title: "My Certificates | Member Dashboard" };

export default async function MemberCertificatesPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const member = await prisma.member.findFirst({
        where: { userId: session.user.id },
        include: { user: { select: { name: true } } },
    });
    if (!member) redirect("/member/dashboard");

    const certs = await prisma.certificate.findMany({
        where: { memberId: member.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto relative z-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 p-8 sm:p-12 group">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-100 h-100 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-75 h-75 bg-blue-300/20 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
                
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                            <Shield className="w-8 h-8 text-emerald-600" /> My Certificates
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 max-w-xl">
                            A showcase of your official achievements, contributions, and memberships with Nirashray Foundation.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/60 px-5 py-3 rounded-2xl border border-white shadow-sm shrink-0">
                        <Award className="w-6 h-6 text-emerald-600" />
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-none text-lg">{certs.length}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Certificates</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certificates Grid */}
            {certs.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-lg text-center py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-white/40 pointer-events-none" />
                    <Award className="w-16 h-16 text-emerald-600/20 mx-auto mb-6 drop-shadow-sm" />
                    <h3 className="font-serif text-xl font-bold text-slate-700 mb-2">No certificates yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Certificates are issued by administrators to recognize your contributions and milestones.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certs.map((cert) => (
                        <div key={cert.id} className="group relative">
                            <div className="absolute -inset-1 rounded-3xl bg-linear-to-br from-emerald-100/50 to-blue-100/50 -z-10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Card className="border border-white/80 bg-white/60 backdrop-blur-xl shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 h-full flex flex-col group-hover:-translate-y-1">
                                <CardContent className="p-0 flex flex-col h-full">
                                    {/* Card Header (Pattern Top) */}
                                    <div className="h-16 relative overflow-hidden bg-linear-to-r from-emerald-600 to-emerald-800">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                                        <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-white/60 to-transparent" />
                                    </div>

                                    {/* Medallion */}
                                    <div className="px-6 flex justify-between items-end -mt-8 relative z-10 mb-2">
                                        <div className="w-16 h-16 rounded-full bg-white p-1.5 shadow-md">
                                            <div className="w-full h-full rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform duration-500">
                                                <Award className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <Badge className="bg-white/80 backdrop-blur-md text-emerald-800 border-white shadow-sm font-bold tracking-widest uppercase text-[9px] px-3 py-1 mb-2 group-hover:bg-emerald-50 transition-colors">
                                            {CERTIFICATE_LABELS[cert.type as keyof typeof CERTIFICATE_LABELS] || cert.type}
                                        </Badge>
                                    </div>

                                    {/* Content */}
                                    <div className="px-6 py-4 grow flex flex-col">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Official Document
                                        </p>
                                        <h3 className="font-serif text-xl font-bold text-slate-800 leading-tight mb-3 group-hover:text-emerald-700 transition-colors">
                                            {cert.title}
                                        </h3>
                                        
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between mb-4">
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Certificate No.</p>
                                                <p className="text-xs font-mono font-semibold text-slate-700">{cert.certificateNo}</p>
                                            </div>
                                        </div>

                                        {cert.description ? (
                                            <div className="text-sm text-slate-500 font-serif leading-relaxed line-clamp-3 prose-sm prose-p:my-0 grow" dangerouslySetInnerHTML={{ __html: cert.description }} />
                                        ) : (
                                            <div className="grow" />
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-6 py-5 bg-white border-t border-slate-50 flex items-center justify-between mt-auto gap-3">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Issued Date</p>
                                            <p className="text-sm font-semibold text-slate-700">{formatDate(cert.issueDate)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CertificateDownloadButton
                                                certificateNo={cert.certificateNo}
                                                memberName={member.user?.name || "Member"}
                                                issueDate={cert.issueDate.toISOString()}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
