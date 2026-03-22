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
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="font-serif text-4xl font-bold mb-3">Photo Gallery</h1>
                    <p className="text-blue-200">A visual journey through our impact and community</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-10">
                {albums.length === 0 ? (
                    <p className="text-center text-slate-400 py-20">No albums available yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {albums.map((album) => {
                            const cover = album.coverImage || album.photos[0]?.imageUrl;
                            return (
                                <Link key={album.id} href={`/gallery/${album.slug}`}>
                                    <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 aspect-[4/3]">
                                        {cover ? (
                                            <Image src={cover} alt={album.title} fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 33vw" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <Images className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            {album.isFeatured && (
                                                <span className="inline-block bg-amber-400 text-slate-900 text-xs px-2 py-0.5 rounded font-bold mb-1">Featured</span>
                                            )}
                                            <p className="font-semibold text-white">{album.title}</p>
                                            <p className="text-white/70 text-sm">{album._count.photos} photos</p>
                                        </div>
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
