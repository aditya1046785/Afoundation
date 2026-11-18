export const dynamic = "force-dynamic";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const album = await prisma.galleryAlbum.findUnique({ where: { slug } });
    if (!album) return { title: "Album Not Found" };
    return { title: `${album.title} — Gallery`, description: album.description || "" };
}

export default async function AlbumPage({ params }: Props) {
    const { slug } = await params;
    const album = await prisma.galleryAlbum.findUnique({
        where: { slug, isVisible: true },
        include: { photos: { orderBy: { displayOrder: "asc" } } },
    });
    if (!album) notFound();

    return (
        <div className="min-h-screen bg-[#fcf9f4] relative overflow-hidden">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply transition-opacity duration-1000" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

            <div className="relative pt-32 pb-16 px-4 border-b border-brand-accent-900/10 bg-[#fffcf5] overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-brand-accent-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-neutral-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10">
                    <Link href="/gallery" className="inline-flex items-center gap-2 text-brand-accent-700 hover:text-brand-accent-900 text-sm mb-8 transition-colors uppercase tracking-widest font-semibold pb-1 border-b border-brand-accent-700/30 hover:border-brand-accent-900">
                        <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Back to Gallery
                    </Link>
                    <h1 className="font-serif text-5xl md:text-6xl text-brand-neutral-900 mb-6 tracking-tight">{album.title}</h1>
                    {album.description && <p className="text-brand-neutral-600 font-medium text-lg leading-relaxed max-w-2xl">{album.description}</p>}
                    <p className="inline-block mt-8 text-xs uppercase tracking-widest font-bold text-brand-accent-900/60 bg-brand-accent-100/50 px-4 py-2 rounded-full border border-brand-accent-200/50">{album.photos.length} photos</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-16 relative z-10">
                {album.photos.length === 0 ? (
                    <p className="text-center text-brand-neutral-400 font-medium py-24 border border-dashed border-brand-accent-900/20 rounded-2xl bg-white/50 backdrop-blur-sm">No photos in this exhibition yet.</p>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        {album.photos.map((photo) => (
                            <div key={photo.id} className="break-inside-avoid group bg-white p-3 rounded-lg shadow-xl shadow-brand-neutral-200/50 border border-brand-neutral-100 relative overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-accent-900/10">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                                <div className="relative overflow-hidden rounded border border-brand-neutral-100">
                                    <Image
                                        src={photo.imageUrl}
                                        alt={photo.caption || album.title}
                                        width={600} height={400}
                                        className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-[1.03] filter group-hover:contrast-105 group-hover:saturate-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                    {photo.caption && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                                            <p className="text-white text-sm font-medium tracking-wide translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{photo.caption}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
