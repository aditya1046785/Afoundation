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
        <div className="min-h-screen bg-white">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="font-serif text-4xl font-bold mb-3">Blog & Stories</h1>
                    <p className="text-blue-200">Updates, impact stories, and insights from our work</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-10">
                {/* Search */}
                <div className="relative max-w-md mx-auto mb-10">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search articles..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-slate-100 rounded-2xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-slate-400 py-20">No posts found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filtered.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-slate-100"
                            >
                                <div className="aspect-video relative bg-blue-50 overflow-hidden">
                                    {post.featuredImage ? (
                                        <Image src={post.featuredImage} alt={post.title} fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, 33vw" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                            <Tag className="w-10 h-10 text-blue-300" />
                                        </div>
                                    )}
                                    {post.category && (
                                        <span className="absolute top-3 left-3 bg-blue-800 text-white text-xs px-2 py-1 rounded-lg font-medium">{post.category}</span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                                        {post.publishedAt && (
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(new Date(post.publishedAt))}</span>
                                        )}
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{estimateReadingTime(post.excerpt || "")} min</span>
                                    </div>
                                    <h3 className="font-serif font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-800 transition-colors mb-2">{post.title}</h3>
                                    {post.excerpt && <p className="text-slate-500 text-sm line-clamp-3 mb-3">{post.excerpt}</p>}
                                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-blue-700 font-medium text-sm hover:gap-2 transition-all">
                                        Read More <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-10">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                        <span className="text-sm text-slate-500 flex items-center px-3">Page {page} of {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
