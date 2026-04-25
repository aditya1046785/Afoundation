export const dynamic = "force-dynamic";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Download, FileText, ArrowRight } from "lucide-react";

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
        <div className="min-h-screen bg-[#fffcf5] relative overflow-hidden font-light pt-20">
            {/* Subtle global paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply fixed"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Banner Section */}
            <div className="relative py-24 text-center border-b border-amber-200/40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-50/60 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />
                
                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">
                        Resources
                    </p>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-slate-800 tracking-tight relative inline-block">
                        Downloads
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h1>
                    <p className="text-slate-500 text-xl font-light max-w-2xl mx-auto leading-relaxed mt-4">
                        Access official reports, impact summaries, and essential documents.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl py-20 relative z-10">
                {categories.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 rounded-[2rem] border border-white/50 backdrop-blur-sm">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-light text-lg">No documents available yet. Check back later.</p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <div key={category} className="mb-16">
                            {/* Elegant Category Header */}
                            <div className="flex items-center gap-6 mb-10">
                                <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 tracking-tight whitespace-nowrap">{category}</h2>
                                <div className="h-px w-full bg-gradient-to-r from-slate-200 to-transparent flex-1 mt-2" />
                            </div>

                            <div className="space-y-4">
                                {documents.filter(d => d.category === category).map((doc) => (
                                    <div key={doc.id} className="group bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-amber-200/60 transition-all duration-300 gap-6">
                                        <div className="flex items-start md:items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors duration-300">
                                                <FileText className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-serif font-bold text-slate-800 text-xl tracking-tight mb-1">{doc.title}</p>
                                                {doc.description && <p className="text-sm text-slate-500 font-light leading-relaxed max-w-lg mb-3">{doc.description}</p>}
                                                <div className="flex flex-wrap items-center gap-4 mt-1">
                                                    {doc.fileSize && (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold tracking-widest uppercase">
                                                            {doc.fileSize}
                                                        </span>
                                                    )}
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto mt-2 md:mt-0">
                                            <button className="w-full md:w-auto px-6 py-4 bg-slate-50 hover:bg-slate-900 group-hover:bg-slate-900 text-slate-700 hover:text-white group-hover:text-white rounded-xl border border-slate-200 group-hover:border-slate-900 font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm group-hover:shadow-lg">
                                                <Download className="w-4 h-4" /> Download <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ml-1 hidden lg:block" />
                                            </button>
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
