export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { getAllSiteSettings } from "@/lib/site-settings";
import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/public/home/HeroSection";
import { SacredPillarsSection } from "@/components/public/home/SacredPillarsSection";
import { TeamPreview } from "@/components/public/home/TeamPreview";
import { TestimonialsSection } from "@/components/public/home/TestimonialsSection";
import { SevaInActionSection } from "@/components/public/home/SevaInActionSection";
import { QuickDonationSection } from "@/components/public/home/QuickDonationSection";
import { OnboardingSection } from "@/components/public/home/OnboardingSection";
import { EventsComplianceSection } from "@/components/public/home/EventsComplianceSection";

export const metadata: Metadata = {
    title: "Home | Nirashray Foundation",
    description: "Nirashray Foundation — Empowering Lives, Building Hope. Join us in making a difference through education, healthcare, and community development.",
};

export default async function HomePage() {
    const [settings, teamMembers] = await Promise.all([
        getAllSiteSettings(),
        prisma.teamMember.findMany({
            where: { isVisible: true },
            orderBy: [{ displayOrder: "asc" }],
            take: 8,
        }),
    ]);

    return (
        <>
            <HeroSection />
            <SacredPillarsSection />
            <SevaInActionSection />
            <QuickDonationSection />
            <OnboardingSection />
            <EventsComplianceSection />
            {teamMembers.length > 0 && <TeamPreview settings={settings} members={teamMembers} />}
            <TestimonialsSection settings={settings} />
        </>
    );
}
