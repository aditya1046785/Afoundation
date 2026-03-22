import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { Calendar, Clock, Eye, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return { title: "Post Not Found" };
    return { title: post.title, description: post.excerpt || "" };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { slug, status: "PUBLISHED" },
        include: { author: { select: { name: true, image: true } } },
    });
    if (!post) notFound();

    // Increment views
    await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 py-20 text-white">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Link href="/blog" className="inline-flex items-center gap-1 text-blue-300 hover:text-white text-sm mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>
                    {post.category && (
                        <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-lg font-medium mb-3">{post.category}</span>
                    )}
                    <h1 className="font-serif text-4xl font-bold mb-4 leading-tight">{post.title}</h1>
                    <div className="flex items-center gap-4 text-blue-200 text-sm">
                        {post.author && <span>By {post.author.name}</span>}
                        {post.publishedAt && (
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(post.publishedAt)}</span>
                        )}
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{estimateReadingTime(post.content)} min read</span>
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views} views</span>
                    </div>
                </div>
            </div>

            {/* Image */}
            {post.featuredImage && (
                <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10">
                    <div className="rounded-2xl overflow-hidden shadow-2xl aspect-video relative">
                        <Image src={post.featuredImage} alt={post.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 800px" />
                    </div>
                </div>
            )}

            {/* Content */}
            <article className="container mx-auto px-4 max-w-3xl py-12">
                <div className="prose prose-lg prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

                {/* Tags */}
                {post.tags && (
                    <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-200">
                        <Tag className="w-4 h-4 text-slate-400" />
                        {post.tags.split(",").map((tag: string) => (
                            <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{tag.trim()}</span>
                        ))}
                    </div>
                )}
            </article>
        </div>
    );
}
