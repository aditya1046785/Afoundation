"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    category: string | null;
    publishedAt: Date | null;
    views: number;
}

interface BlogPreviewProps {
    settings: Record<string, string>;
    posts: BlogPost[];
}

export function BlogPreview({ settings, posts }: BlogPreviewProps) {
    const heading = settings.blog_section_heading || "Latest Stories";
    const subtext = settings.blog_section_subtext || "Read about our impact and journey";

    return (
        <section className="py-20 md:py-24 bg-[#fbfaf8] relative overflow-hidden">
            {/* Subtle paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Watercolor BG Blob */}
            <div className="absolute top-[30%] left-[40%] w-150 h-150 bg-amber-50/50 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">Journal</p>
                    <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-800 mb-6 tracking-tight relative inline-block">
                        {heading}
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto font-light text-lg">{subtext}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {posts.map((post, idx) => (
                        <article
                            key={post.id}
                            className="group flex flex-col"
                        >
                            {/* Artistic Floating Image */}
                            <div className="aspect-[4/3] relative bg-[#fdfcfa] rounded-2xl overflow-hidden mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-4 border-white group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group-hover:-translate-y-2 transition-all duration-500">
                                {post.featuredImage ? (
                                    <Image
                                        src={post.featuredImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                        <Tag className="w-8 h-8 text-amber-200" />
                                    </div>
                                )}
                                {post.category && (
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold shadow-sm">
                                        {post.category}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col pl-4 border-l border-amber-200/50 group-hover:border-amber-400 transition-colors duration-500">
                                <div className="flex items-center gap-3 text-xs text-amber-600 font-medium tracking-widest uppercase mb-4">
                                    {post.publishedAt && (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(post.publishedAt)}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-slate-800 mb-4 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                                    <Link href={`/blog/${post.slug}`} className="hover:underline decoration-amber-300 decoration-2 underline-offset-4">
                                        {post.title}
                                    </Link>
                                </h3>
                                {post.excerpt && (
                                    <p className="text-slate-500 text-base mb-6 line-clamp-3 font-light leading-relaxed flex-1">
                                        {post.excerpt}
                                    </p>
                                )}
                                <div className="mt-auto pt-2">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center text-slate-800 font-medium text-sm border-b border-transparent group-hover:border-slate-800 pb-1 transition-all duration-300"
                                    >
                                        Read Story <ArrowRight className="w-3 h-3 ml-2 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="text-center mt-20">
                    <Link href="/blog">
                        <Button variant="ghost" className="rounded-full px-8 py-6 text-base font-medium text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 group shadow-none">
                            View All Stories
                            <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
