export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { getAllSiteSettings } from "@/lib/site-settings";
import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/public/home/HeroSection";
import { ImpactStats } from "@/components/public/home/ImpactStats";
import { AboutBrief } from "@/components/public/home/AboutBrief";
import { CausesSection } from "@/components/public/home/CausesSection";
import { CrowdfundingSection } from "@/components/public/home/CrowdfundingSection";
import { DonateCTA } from "@/components/public/home/DonateCTA";
import { TeamPreview } from "@/components/public/home/TeamPreview";
import { GalleryPreview } from "@/components/public/home/GalleryPreview";
import { BlogPreview } from "@/components/public/home/BlogPreview";
import { TestimonialsSection } from "@/components/public/home/TestimonialsSection";

export const metadata: Metadata = {
    title: "Home | Nirashray Foundation",
    description: "Nirashray Foundation — Empowering Lives, Building Hope. Join us in making a difference through education, healthcare, and community development.",
};

function pickRandomItems<T>(items: T[], limit: number) {
    return [...items]
        .map((item) => ({ item, sort: Math.random() }))
        .sort((first, second) => first.sort - second.sort)
        .slice(0, limit)
        .map(({ item }) => item);
}

export default async function HomePage() {
    const [settings, teamMembers, recentBlogs, galleryAlbums, allVisibleGalleryAlbums, activeCampaigns] = await Promise.all([
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
        prisma.galleryAlbum.findMany({
            where: { isVisible: true },
            select: {
                coverImage: true,
                photos: {
                    select: { imageUrl: true },
                    orderBy: { displayOrder: "asc" },
                },
            },
            orderBy: { displayOrder: "asc" },
        }),
        prisma.crowdfundingCampaign.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 4,
        }),
    ]);

    const heroGalleryImages = Array.from(
        new Set(
            allVisibleGalleryAlbums
                .flatMap((album) => [album.coverImage, ...album.photos.map((photo) => photo.imageUrl)])
                .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
        )
    );
    const storyGalleryImages = pickRandomItems(heroGalleryImages, 6);

    return (
        <>
            <HeroSection settings={settings} />
            <ImpactStats settings={settings} />
            <AboutBrief settings={settings} galleryImages={storyGalleryImages} />
            <CausesSection settings={settings} />
            {activeCampaigns.length > 0 && <CrowdfundingSection campaigns={activeCampaigns} />}
            <DonateCTA settings={settings} />
            {teamMembers.length > 0 && <TeamPreview settings={settings} members={teamMembers} />}
            {galleryAlbums.length > 0 && <GalleryPreview settings={settings} albums={galleryAlbums} />}
            {recentBlogs.length > 0 && <BlogPreview settings={settings} posts={recentBlogs} />}
            <TestimonialsSection settings={settings} />
        </>
    );
}
