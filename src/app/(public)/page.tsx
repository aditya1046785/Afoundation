import { Metadata } from "next";
import { getAllSiteSettings } from "@/lib/site-settings";
import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/public/home/HeroSection";
import { ImpactStats } from "@/components/public/home/ImpactStats";
import { AboutBrief } from "@/components/public/home/AboutBrief";
import { CausesSection } from "@/components/public/home/CausesSection";
import { DonateCTA } from "@/components/public/home/DonateCTA";
import { TeamPreview } from "@/components/public/home/TeamPreview";
import { GalleryPreview } from "@/components/public/home/GalleryPreview";
import { BlogPreview } from "@/components/public/home/BlogPreview";
import { TestimonialsSection } from "@/components/public/home/TestimonialsSection";

export const metadata: Metadata = {
    title: "Home | Nirashray Foundation",
    description: "Nirashray Foundation — Empowering Lives, Building Hope. Join us in making a difference through education, healthcare, and community development.",
};

export default async function HomePage() {
    const [settings, teamMembers, recentBlogs, galleryAlbums] = await Promise.all([
        getAllSiteSettings(),
        prisma.teamMember.findMany({
            where: { isVisible: true },
            orderBy: [{ displayOrder: "asc" }],
            take: 8,
        }),
        prisma.blogPost.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: "desc" },
            take: 3,
        }),
        prisma.galleryAlbum.findMany({
            where: { isVisible: true, isFeatured: true },
            include: { photos: { take: 4, orderBy: { displayOrder: "asc" } } },
            take: 3,
            orderBy: { displayOrder: "asc" },
        }),
    ]);

    return (
        <>
            <HeroSection settings={settings} />
            <ImpactStats settings={settings} />
            <AboutBrief settings={settings} />
            <CausesSection settings={settings} />
            <DonateCTA settings={settings} />
            {teamMembers.length > 0 && <TeamPreview settings={settings} members={teamMembers} />}
            {galleryAlbums.length > 0 && <GalleryPreview settings={settings} albums={galleryAlbums} />}
            {recentBlogs.length > 0 && <BlogPreview settings={settings} posts={recentBlogs} />}
            <TestimonialsSection settings={settings} />
        </>
    );
}
