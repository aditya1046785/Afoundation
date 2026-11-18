export const dynamic = "force-dynamic";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";

export const metadata: Metadata = {
    title: "Gallery",
    description: "Explore moments from Nirashray Foundation's events, programs, and community activities.",
};

export default async function GalleryPage() {
    const albums = await prisma.galleryAlbum.findMany({
        where: { isVisible: true },
        include: { _count: { select: { photos: true } }, photos: { take: 1, orderBy: { displayOrder: "asc" } } },
        orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
    });

    return (
        <div className="min-h-screen bg-[#fcf9f4] relative overflow-hidden font-normal pt-20">
            {/* Subtle global paper noise */}
            <div
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply fixed"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Banner Section */}
            <div className="relative py-24 text-center border-b border-brand-accent-200/40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-emerald-50/50 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <p className="font-serif italic text-brand-accent-600 text-xl tracking-wide mb-4">
                        Visual Journey
                    </p>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-brand-neutral-800 tracking-tight relative inline-block">
                        Photo Gallery
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-brand-accent-300 stroke-current opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h1>
                    <p className="text-brand-neutral-500 text-xl font-normal max-w-2xl mx-auto leading-relaxed mt-4">
                        A visual exploration of our impact, community drives, and the smiles we share.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl py-20 relative z-10">
                {albums.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 rounded-2xl border border-white/50 backdrop-blur-sm max-w-3xl mx-auto">
                        <Images className="w-12 h-12 text-brand-neutral-300 mx-auto mb-4" />
                        <p className="text-brand-neutral-500 font-normal text-lg">No albums available yet. Check back soon for updates.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                        {albums.map((album, idx) => {
                            const cover = album.coverImage || album.photos[0]?.imageUrl;
                            // Alternate slight rotation for artistic feel
                            const rotation = idx % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1";

                            return (
                                <Link key={album.id} href={`/gallery/${album.slug}`} className="group flex flex-col">
                                    <div className={`relative aspect-[4/3] bg-white p-3 md:p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-brand-neutral-100 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-700 ${rotation}`}>
                                        <div className="relative w-full h-full overflow-hidden rounded-lg bg-brand-neutral-50">
                                            {cover ? (
                                                <Image src={cover} alt={album.title} fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                                    sizes="(max-width: 768px) 100vw, 33vw" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Images className="w-10 h-10 text-brand-neutral-200" />
                                                </div>
                                            )}
                                            {/* Subtle overlay */}
                                            <div className="absolute inset-0 bg-brand-neutral-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            {album.isFeatured && (
                                                <span className="absolute top-4 right-4 bg-brand-accent-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold shadow-sm">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-6 text-center px-4">
                                        <h3 className="font-serif text-2xl font-bold text-brand-neutral-800 mb-2 group-hover:text-brand-accent-700 transition-colors">
                                            {album.title}
                                        </h3>
                                        <p className="text-brand-neutral-500 text-sm tracking-widest uppercase font-medium">
                                            {album._count.photos} {album._count.photos === 1 ? 'Photograph' : 'Photographs'}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
