import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const siteUrl = "https://nirashrayfoundation.in";
const publicPaths = [
  "", "/about", "/blog", "/contact", "/donate", "/downloads",
  "/events", "/gallery", "/team", "/donation-privacy-policy",
  "/refund-and-cancellation-policy", "/terms-and-conditions",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, albums] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.galleryAlbum.findMany({
      where: { isVisible: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...publicPaths.map((path) => ({ url: `${siteUrl}${path}` })),
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt,
    })),
    ...albums.map((album) => ({
      url: `${siteUrl}/gallery/${encodeURIComponent(album.slug)}`,
      lastModified: album.updatedAt,
    })),
  ];
}
