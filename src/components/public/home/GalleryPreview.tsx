"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Images } from "lucide-react";

interface GalleryPreviewProps {
    settings: Record<string, string>;
    albums: Array<{
        id: string;
        title: string;
        slug: string;
        coverImage: string | null;
        photos: Array<{ id: string; imageUrl: string; caption: string | null }>;
    }>;
}

export function GalleryPreview({ settings, albums }: GalleryPreviewProps) {
    const heading = settings.gallery_section_heading || "Our Gallery";
    const subtext = settings.gallery_section_subtext || "Moments that define our journey";

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Gallery</p>
                    <h2 className="font-serif text-4xl font-bold text-slate-900 mb-4">{heading}</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">{subtext}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {albums.map((album, albumIdx) => {
                        const coverPhoto = album.coverImage || album.photos[0]?.imageUrl;
                        return (
                            <motion.div
                                key={album.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: albumIdx * 0.1 }}
                                className="group"
                            >
                                <Link href={`/gallery/${album.slug}`}>
                                    <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 aspect-[4/3]">
                                        {coverPhoto ? (
                                            <Image
                                                src={coverPhoto}
                                                alt={album.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <Images className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <p className="font-semibold text-white text-sm">{album.title}</p>
                                            <p className="text-white/70 text-xs">{album.photos.length} photos</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="text-center mt-10">
                    <Link href="/gallery">
                        <Button variant="outline" className="border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white">
                            View Full Gallery
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
