"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Search, Tag, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, estimateReadingTime } from "@/lib/utils";

interface Post {
    id: string; title: string; slug: string; excerpt: string | null;
    featuredImage: string | null; category: string | null;
    publishedAt: string | null; views: number;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const pageSize = 9;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        const res = await fetch(`/api/blog?${params}`);
        const data = await res.json();
        if (data.success) {
            setPosts(data.data.posts);
            setTotal(data.data.total);
        }
        setLoading(false);
    }, [page]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const totalPages = Math.ceil(total / pageSize);
    const filtered = search ? posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase())) : posts;

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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-brand-accent-50/50 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <p className="font-serif italic text-brand-accent-600 text-xl tracking-wide mb-4">
                        The Journal
                    </p>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-brand-neutral-800 tracking-tight relative inline-block">
                        Blog & Stories
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-brand-accent-300 stroke-current opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h1>
                    <p className="text-brand-neutral-500 text-xl font-normal max-w-2xl mx-auto leading-relaxed mt-4">
                        Updates, impact stories, and insights from our ongoing work in the community.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl py-16 relative z-10">
                {/* Elegant Search */}
                <div className="relative max-w-xl mx-auto mb-16">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-brand-accent-500" />
                    </div>
                    <Input
                        placeholder="Search our journal..."
                        className="pl-12 h-14 rounded-full bg-white/60 backdrop-blur-md border border-brand-neutral-200/50 shadow-sm text-lg focus-visible:ring-brand-accent-500 font-normal"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-brand-neutral-100/50 border border-brand-neutral-100/50 rounded-2xl h-80 animate-pulse backdrop-blur-sm" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 bg-white/40 rounded-2xl border border-white/50 backdrop-blur-sm">
                        <Tag className="w-12 h-12 text-brand-neutral-300 mx-auto mb-4" />
                        <p className="text-brand-neutral-500 text-lg font-normal">No journal entries found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filtered.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.8 }}
                                className="group flex flex-col"
                            >
                                {/* Artistic Floating Image */}
                                <div className="aspect-[4/3] relative bg-[#fcf9f4] rounded-2xl overflow-hidden mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-4 border-white group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group-hover:-translate-y-2 transition-all duration-500">
                                    {post.featuredImage ? (
                                        <Image src={post.featuredImage} alt={post.title} fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            sizes="(max-width: 768px) 100vw, 33vw" />
                                    ) : (
                                        <div className="w-full h-full bg-brand-neutral-50 flex items-center justify-center">
                                            <Tag className="w-8 h-8 text-brand-accent-200" />
                                        </div>
                                    )}
                                    {post.category && (
                                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-neutral-800 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold shadow-sm">
                                            {post.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col pl-4 border-l border-brand-accent-200/50 group-hover:border-brand-accent-400 transition-colors duration-500">
                                    <div className="flex items-center gap-3 text-xs text-brand-accent-600 font-medium tracking-widest uppercase mb-4">
                                        {post.publishedAt && (
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(new Date(post.publishedAt))}</span>
                                        )}
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{estimateReadingTime(post.excerpt || "")} min read</span>
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-brand-neutral-800 mb-4 leading-snug line-clamp-2 group-hover:text-brand-accent-700 transition-colors">
                                        <Link href={`/blog/${post.slug}`} className="hover:underline decoration-brand-accent-300 decoration-2 underline-offset-4">
                                            {post.title}
                                        </Link>
                                    </h3>
                                    {post.excerpt && <p className="text-brand-neutral-500 text-base mb-6 line-clamp-3 font-normal leading-relaxed flex-1">{post.excerpt}</p>}
                                    <div className="mt-auto pt-2">
                                        <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-brand-neutral-800 font-medium text-sm border-b border-transparent group-hover:border-brand-neutral-800 pb-1 transition-all duration-300">
                                            Read Story <ArrowRight className="w-3 h-3 ml-2 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}

                {/* Elegant Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-4 mt-20 items-center">
                         <Button
                            variant="ghost"
                            className="rounded-[8px] border border-brand-neutral-200 hover:border-brand-neutral-800 text-brand-neutral-600 hover:bg-transparent"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium tracking-wide text-brand-accent-700">Page {page} of {totalPages}</span>
                        <Button
                            variant="ghost"
                            className="rounded-[8px] border border-brand-neutral-200 hover:border-brand-neutral-800 text-brand-neutral-600 hover:bg-transparent"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
