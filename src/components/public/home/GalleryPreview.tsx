"use client";

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
        <section className="py-24 bg-[#fdfcfa] relative overflow-hidden">
            {/* Subtle paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.2] pointer-events-none mix-blend-multiply"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Watercolor Background Accent */}
            <div className="absolute top-[10%] -left-[10%] w-125 h-125 bg-amber-100/30 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">
                        Gallery
                    </p>
                    <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-800 mb-6 tracking-tight relative inline-block">
                        {heading}
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto font-light text-lg">{subtext}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {albums.map((album, albumIdx) => {
                        const coverPhoto = album.coverImage || album.photos[0]?.imageUrl;
                        return (
                            <div
                                key={album.id}
                                className={`group relative ${albumIdx === 1 ? 'md:mt-12' : ''}`}
                            >
                                <Link href={`/gallery/${album.slug}`}>
                                    {/* Artistic frame */}
                                     <div className="relative overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 aspect-4/5 bg-slate-100 border border-white/50"
                                         style={{ borderRadius: albumIdx % 2 === 0 ? '2rem 1rem 4rem 1rem' : '1rem 3rem 1rem 2rem' }}>
                                        {coverPhoto ? (
                                            <Image
                                                src={coverPhoto}
                                                alt={album.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <Images className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                            <p className="font-serif font-bold text-white text-2xl mb-1">{album.title}</p>
                                            <p className="text-amber-300 font-medium text-sm tracking-wide">{album.photos.length} photos</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-20">
                    <Link href="/gallery">
                        <Button variant="ghost" className="rounded-full px-8 py-6 text-base font-medium text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 group shadow-none">
                            View Full Gallery
                            <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
