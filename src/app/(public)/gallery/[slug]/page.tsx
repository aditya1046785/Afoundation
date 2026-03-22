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
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/gallery" className="inline-flex items-center gap-1 text-blue-300 hover:text-white text-sm mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Gallery
                    </Link>
                    <h1 className="font-serif text-4xl font-bold mb-2">{album.title}</h1>
                    {album.description && <p className="text-blue-200">{album.description}</p>}
                    <p className="text-blue-300 text-sm mt-2">{album.photos.length} photos</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-10">
                {album.photos.length === 0 ? (
                    <p className="text-center text-slate-400 py-20">No photos in this album yet.</p>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                        {album.photos.map((photo) => (
                            <div key={photo.id} className="break-inside-avoid group relative rounded-xl overflow-hidden shadow-md">
                                <Image
                                    src={photo.imageUrl}
                                    alt={photo.caption || album.title}
                                    width={600} height={400}
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                {photo.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm">{photo.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
