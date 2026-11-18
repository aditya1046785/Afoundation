export const dynamic = "force-dynamic";
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
        <div className="min-h-screen bg-[#fcf9f4] relative overflow-hidden">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply transition-opacity duration-1000" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

            {/* Hero */}
            <div className="relative pt-32 pb-24 px-4 border-b border-brand-accent-900/10 bg-[#fffcf5] overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-brand-accent-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-brand-neutral-300/10 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto max-w-3xl relative z-10 text-center">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-brand-accent-700 hover:text-brand-accent-900 text-sm mb-10 transition-colors uppercase tracking-widest font-semibold pb-1 border-b border-brand-accent-700/30 hover:border-brand-accent-900">
                        <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Back to Chronicle
                    </Link>

                    {post.category && (
                        <div className="mb-6 flex justify-center">
                            <span className="inline-block bg-white border border-brand-accent-200 text-brand-accent-900 text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full font-bold shadow-sm">{post.category}</span>
                        </div>
                    )}

                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-neutral-900 mb-8 leading-[1.15] tracking-tight">{post.title}</h1>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-brand-neutral-500 font-medium text-sm">
                        {post.author && <span className="text-brand-neutral-800">By <span className="font-semibold">{post.author.name}</span></span>}
                        {post.publishedAt && (
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-accent-600/70" />{formatDate(post.publishedAt)}</span>
                        )}
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-accent-600/70" />{estimateReadingTime(post.content)} min read</span>
                        <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-brand-accent-600/70" />{post.views} views</span>
                    </div>
                </div>
            </div>

            {/* Image */}
            {post.featuredImage && (
                <div className="container mx-auto px-4 max-w-5xl -mt-16 relative z-20">
                    <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-brand-neutral-900/10 border border-brand-neutral-100 transform -rotate-1 hover:rotate-0 transition-transform duration-700">
                        <div className="rounded-xl overflow-hidden aspect-video relative border border-brand-neutral-100">
                            <Image src={post.featuredImage} alt={post.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 1000px" priority />
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <article className="container mx-auto px-4 max-w-3xl py-20 relative z-10">
                <div className="prose prose-lg prose-slate prose-headings:font-serif prose-headings:tracking-tight prose-a:text-brand-accent-700 hover:prose-a:text-brand-accent-800 prose-img:rounded-xl prose-img:shadow-md prose-blockquote:border-l-brand-accent-500 prose-blockquote:bg-brand-accent-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

                {/* Tags */}
                {post.tags && (
                    <div className="flex flex-wrap items-center gap-3 mt-16 pt-8 border-t border-brand-neutral-200/60">
                        <Tag className="w-5 h-5 text-brand-accent-600/60" strokeWidth={1.5} />
                        {post.tags.split(",").map((tag: string) => (
                            <span key={tag} className="bg-white border border-brand-neutral-200 shadow-sm text-brand-neutral-600 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full hover:border-brand-accent-300 hover:bg-brand-accent-50 transition-colors cursor-default">{tag.trim()}</span>
                        ))}
                    </div>
                )}
            </article>
        </div>
    );
}
