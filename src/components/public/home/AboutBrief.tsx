"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface AboutBriefProps {
    settings: Record<string, string>;
    galleryImages: string[];
}

export function AboutBrief({ settings, galleryImages }: AboutBriefProps) {
    const eyebrow = settings.about_brief_eyebrow || "Our Story";
    const heading = settings.about_brief_heading || "Who We Are";
    const text = settings.about_brief_text || "";
    const image = settings.about_brief_image || "/about-brief.jpg";
    const ctaText = settings.about_brief_cta_text || "Learn More About Us";
    const ctaLink = settings.about_brief_cta_link || "/about";
    const storyPhotos = useMemo(() => {
        const fallbackPhotos = [image, settings.hero_image || "/hero-bg.jpg"];
        const uniquePhotos = Array.from(
            new Set([...(galleryImages || []), ...fallbackPhotos].filter(Boolean))
        );

        return uniquePhotos.length > 0 ? uniquePhotos : ["/hero-bg.jpg"];
    }, [galleryImages, image, settings.hero_image]);

    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    useEffect(() => {
        if (storyPhotos.length <= 1) return;

        const timer = window.setInterval(() => {
            setActivePhotoIndex((current) => (current + 1) % storyPhotos.length);
        }, 4500);

        return () => window.clearInterval(timer);
    }, [storyPhotos]);

    if (!text) return null;

    const visiblePhotoIndex = activePhotoIndex % storyPhotos.length;
    const getPhoto = (offset: number) => storyPhotos[(visiblePhotoIndex + offset) % storyPhotos.length];

    const mainPhoto = getPhoto(0);
    const sidePhotoOne = getPhoto(1);
    const sidePhotoTwo = getPhoto(2);

    const highlights = (settings.about_brief_highlights || "Registered NGO under Societies Registration Act\n80G Tax Exemption Certificate\nFully transparent fund utilization\nActive across multiple communities")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <section className="py-20 md:py-24 bg-[#fffdfa] relative overflow-hidden">
            {/* Delicate Watercolor Splash in BG */}
            <div className="absolute -top-[10%] left-[20%] w-125 h-125 bg-amber-100/30 rounded-full mix-blend-multiply filter blur-[90px] pointer-events-none" />
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
                    {/* Authentic Framed Collage */}
                    <div className="relative flex w-full justify-center lg:justify-start">
                        <div className="relative h-88 w-full max-w-md sm:h-104 lg:h-112 min-[1200px]:h-128 lg:max-w-[540px]">
                            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.4rem] bg-linear-to-br from-white/90 to-amber-50/90 border border-amber-100 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.45)]" />
                            <div
                                className="absolute inset-0 rounded-[2rem] sm:rounded-[2.4rem] opacity-25 pointer-events-none mix-blend-multiply"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                }}
                            />

                            <div className="absolute inset-4 sm:inset-5 rounded-[1.6rem] sm:rounded-[1.9rem] overflow-hidden bg-slate-200">
                                <div className="absolute inset-0">
                                    <Image
                                        src={mainPhoto}
                                        alt="Community moments"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 448px, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/35 via-slate-900/10 to-transparent" />
                                </div>
                            </div>

                            <div className="absolute -left-2 top-10 h-36 w-28 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200 sm:-left-6 sm:top-14 sm:h-52 sm:w-40 sm:p-2">
                                <div className="relative h-full w-full rounded-xl overflow-hidden bg-slate-100">
                                    <Image
                                        src={sidePhotoOne}
                                        alt="Volunteer highlight"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 112px, 160px"
                                    />
                                </div>
                            </div>

                            <div className="absolute -right-2 bottom-10 h-40 w-32 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200 sm:-right-6 sm:bottom-16 sm:h-56 sm:w-44 sm:p-2">
                                <div className="relative h-full w-full rounded-xl overflow-hidden bg-slate-100">
                                    <Image
                                        src={sidePhotoTwo}
                                        alt="Field work highlight"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 128px, 176px"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-1/4 right-[12%] w-5 h-5 rounded-full bg-amber-400 mix-blend-multiply blur-[2px] sm:w-6 sm:h-6" />
                        <div className="absolute bottom-1/3 left-[8%] w-8 h-8 rounded-full bg-blue-300 mix-blend-multiply blur-[3px] sm:w-10 sm:h-10" />
                        <div className="absolute bottom-[12%] right-[22%] hidden sm:block">
                            <svg width="40" height="40" viewBox="0 0 100 100" className="text-amber-500/50 fill-current">
                                <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"/>
                            </svg>
                        </div>
                    </div>
                    
                    {/* Content Editorial Layout */}
                    <div className="pl-0 lg:pl-4">
                        <div>
                            <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">
                                {eyebrow}
                            </p>
                            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-[1.1] tracking-tight relative inline-block">
                                {heading}
                                <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </h2>
                            
                            <p className="text-slate-500 leading-relaxed mb-10 text-lg font-light max-w-lg">
                                {text}
                            </p>
                        </div>

                        {/* Elegantly styled Highlights */}
                        <ul className="space-y-4 mb-10">
                            {highlights.map((item) => (
                                <li key={item} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                        <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <span className="text-slate-600 font-medium tracking-wide text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div>
                            <Link href={ctaLink}>
                                <Button variant="ghost" className="rounded-full px-8 py-6 text-base font-medium text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 group shadow-none">
                                    {ctaText}
                                    <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
