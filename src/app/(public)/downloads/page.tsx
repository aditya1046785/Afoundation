import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Download, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "Downloads",
    description: "Download documents, reports, and resources from Nirashray Foundation.",
};

interface DownloadDoc {
    id: string; title: string; description: string | null; fileUrl: string;
    fileSize: string | null; category: string; downloadCount: number;
    isVisible: boolean; displayOrder: number;
}

export default async function DownloadsPage() {
    const documents: DownloadDoc[] = await prisma.downloadDocument.findMany({
        where: { isVisible: true },
        orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
    }) as any;

    const categories = [...new Set(documents.map((d: DownloadDoc) => d.category))];

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="font-serif text-4xl font-bold mb-3">Downloads</h1>
                    <p className="text-blue-200">Documents, reports, and resources</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-10">
                {categories.length === 0 ? (
                    <p className="text-center text-slate-400 py-20">No documents available yet.</p>
                ) : (
                    categories.map((category) => (
                        <div key={category} className="mb-10">
                            <h2 className="font-serif text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">{category}</h2>
                            <div className="space-y-3">
                                {documents.filter(d => d.category === category).map((doc) => (
                                    <div key={doc.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-blue-700" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{doc.title}</p>
                                                {doc.description && <p className="text-xs text-slate-400 mt-0.5">{doc.description}</p>}
                                                <div className="flex items-center gap-2 mt-1">
                                                    {doc.fileSize && <Badge variant="outline" className="text-xs">{doc.fileSize}</Badge>}
                                                    <span className="text-xs text-slate-400">{doc.downloadCount} downloads</span>
                                                </div>
                                            </div>
                                        </div>
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50">
                                                <Download className="w-4 h-4 mr-1" /> Download
                                            </Button>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
