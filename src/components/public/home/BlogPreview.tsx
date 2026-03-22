"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { formatDate, estimateReadingTime, truncateText } from "@/lib/utils";

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
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Stories</p>
                    <h2 className="font-serif text-4xl font-bold text-slate-900 mb-4">{heading}</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">{subtext}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post, idx) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                        >
                            {/* Image */}
                            <div className="aspect-video relative bg-blue-50 overflow-hidden">
                                {post.featuredImage ? (
                                    <Image
                                        src={post.featuredImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                        <Tag className="w-12 h-12 text-blue-300" />
                                    </div>
                                )}
                                {post.category && (
                                    <span className="absolute top-3 left-3 bg-blue-800 text-white text-xs px-2 py-1 rounded-lg font-medium">
                                        {post.category}
                                    </span>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                                    {post.publishedAt && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(post.publishedAt)}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {estimateReadingTime(post.excerpt || "")} min read
                                    </span>
                                </div>
                                <h3 className="font-serif font-bold text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-blue-800 transition-colors">
                                    {post.title}
                                </h3>
                                {post.excerpt && (
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                                )}
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-1 text-blue-700 font-medium text-sm hover:gap-2 transition-all"
                                >
                                    Read More <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <Link href="/blog">
                        <Button variant="outline" className="border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white">
                            View All Stories
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
