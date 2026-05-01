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
    const showcasedPhotos = useMemo(() => storyPhotos.slice(0, 6), [storyPhotos]);

    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    useEffect(() => {
        if (showcasedPhotos.length <= 1) return;

        const timer = window.setInterval(() => {
            setActivePhotoIndex((current) => (current + 1) % showcasedPhotos.length);
        }, 4500);

        return () => window.clearInterval(timer);
    }, [showcasedPhotos]);

    if (!text) return null;

    const visiblePhotoIndex = activePhotoIndex % showcasedPhotos.length;
    const mainPhoto = showcasedPhotos[visiblePhotoIndex];

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
                    {/* Featured Moment Gallery */}
                    <div className="relative w-full">
                        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-[560px]">
                            <div className="absolute -inset-3 rounded-[2rem] border border-amber-100 bg-white/75 shadow-[0_25px_70px_-34px_rgba(15,23,42,0.55)] sm:-inset-4 sm:rounded-[2.25rem]" />
                            <div
                                className="absolute -inset-3 rounded-[2rem] opacity-25 pointer-events-none mix-blend-multiply sm:-inset-4 sm:rounded-[2.25rem]"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                }}
                            />

                            <div className="relative grid gap-3 lg:grid-cols-[1fr_5.75rem]">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-200 shadow-[0_22px_55px_-30px_rgba(15,23,42,0.75)] sm:rounded-[1.8rem] lg:aspect-[5/6]">
                                    <Image
                                        key={mainPhoto}
                                        src={mainPhoto}
                                        alt="Nirashray Foundation community moment"
                                        fill
                                        className="object-cover transition-opacity duration-500"
                                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 448px, 460px"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-white/5" />
                                    <div className="absolute left-4 top-4 flex gap-1.5">
                                        {showcasedPhotos.map((photo, index) => (
                                            <span
                                                key={`${photo}-dot`}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                                    index === visiblePhotoIndex ? "w-8 bg-white" : "w-3 bg-white/45"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-6 gap-2 lg:grid-cols-1 lg:grid-rows-6">
                                    {showcasedPhotos.map((photo, index) => (
                                        <button
                                            key={photo}
                                            type="button"
                                            aria-label={`Show story image ${index + 1}`}
                                            onClick={() => setActivePhotoIndex(index)}
                                            className={`relative aspect-square overflow-hidden rounded-xl border bg-white p-1 shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                                                index === visiblePhotoIndex
                                                    ? "border-amber-400 shadow-[0_12px_30px_-18px_rgba(180,83,9,0.9)]"
                                                    : "border-slate-200 opacity-75 hover:opacity-100"
                                            }`}
                                        >
                                            <span className="relative block h-full w-full overflow-hidden rounded-lg bg-slate-100">
                                                <Image
                                                    src={photo}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 1024px) 15vw, 92px"
                                                />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
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
