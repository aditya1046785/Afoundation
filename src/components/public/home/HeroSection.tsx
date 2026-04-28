"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

interface HeroProps {
    settings: Record<string, string>;
    galleryImages: string[];
}

export function HeroSection({ settings, galleryImages }: HeroProps) {
    const badgeText = settings.hero_badge_text || "The Art of Giving";
    const heading = settings.hero_heading || "Nirashray Foundation";
    const subheading = settings.hero_subheading || "Empowering Lives, Building Hope";
    const descriptionSuffix = settings.hero_description_suffix || "Every life we touch adds a new, beautiful color to the canvas of humanity.";
    const cta1Text = settings.hero_cta1_text || "Donate Now";
    const cta1Link = settings.hero_cta1_link || "/donate";
    const cta2Text = settings.hero_cta2_text || "Join Us";
    const cta2Link = settings.hero_cta2_link || "/register";
    const fallbackHeroImage = settings.hero_image || "/hero-bg.jpg";
    const heroPhotos = useMemo(() => {
        const uniquePhotos = Array.from(
            new Set([...(galleryImages || []), fallbackHeroImage].filter(Boolean))
        );

        return uniquePhotos.length > 0 ? uniquePhotos : [fallbackHeroImage];
    }, [galleryImages, fallbackHeroImage]);

    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    useEffect(() => {
        if (heroPhotos.length <= 1) {
            setActivePhotoIndex(0);
            return;
        }

        setActivePhotoIndex(0);

        const timer = window.setInterval(() => {
            setActivePhotoIndex((current) => (current + 1) % heroPhotos.length);
        }, 4500);

        return () => window.clearInterval(timer);
    }, [heroPhotos]);

    const getPhoto = (offset: number) => heroPhotos[(activePhotoIndex + offset) % heroPhotos.length];

    const mainPhoto = getPhoto(0);
    const sidePhotoOne = getPhoto(1);
    const sidePhotoTwo = getPhoto(2);

    return (
        <section className="relative flex items-center justify-center overflow-hidden bg-[#fbfaf8] py-16 min-[900px]:py-20">
            {/* Artistic Canvas Paper Texture */}
            <div 
                className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Delicate Watercolor Splatter / Blobs in the background */}
            <div className="absolute -top-[20%] -left-[10%] w-150 h-150 bg-amber-100/40 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none" />
            <div className="absolute top-[30%] -right-[15%] w-175 h-175 bg-blue-100/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 min-[900px]:grid-cols-12 gap-12 min-[900px]:gap-8 items-center">
                    
                    {/* Left Content Column (The Editorial Typography) */}
                    <div className="min-[900px]:col-span-6 flex flex-col justify-center text-left pt-12 min-[900px]:pt-0">
                        <div>
                            <p className="font-serif italic text-amber-600 text-xl md:text-2xl mb-4 tracking-wide">
                                {badgeText}
                            </p>
                            
                            {/* Artistic Headline */}
                            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-slate-800 leading-[1.1] tracking-tight">
                                {heading.split(' ').map((word, i, arr) => (
                                    <span key={i} className="inline-block relative">
                                        {word}
                                        {i !== arr.length - 1 && <span>&nbsp;</span>}
                                        {/* Golden Underline for emphasis on the first word */}
                                        {i === 0 && (
                                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-400 stroke-current" viewBox="0 0 100 10" preserveAspectRatio="none">
                                                <path d="M0,5 Q50,-5 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </span>
                                ))}
                            </h1>
                        </div>

                        <p className="text-lg md:text-xl text-slate-500 mt-8 max-w-lg leading-relaxed font-light">
                            {subheading} {descriptionSuffix}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 mt-12">
                            {/* Artistic CTA 1 */}
                            <Link href={cta1Link}>
                                <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-7 text-lg font-medium tracking-wide transition-all duration-300 hover:scale-105 group border border-transparent hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
                                    {cta1Text}
                                    <Heart className="w-4 h-4 ml-3 fill-amber-400 text-amber-400 transition-transform group-hover:scale-110" />
                                </Button>
                            </Link>
                            
                            {/* Artistic CTA 2 */}
                            <Link href={cta2Link}>
                                <Button variant="ghost" className="w-full sm:w-auto rounded-full px-8 py-7 text-lg font-medium tracking-wide text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 group">
                                    {cta2Text}
                                    <ArrowRight className="w-4 h-4 ml-2 opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Content Column (Authentic Framed Collage) */}
                    <div className="hidden min-[900px]:flex min-[900px]:col-span-6 relative justify-center min-[900px]:justify-end w-full">
                        <div className="relative w-full h-112 min-[1200px]:h-128 max-w-xl mx-auto">
                            <div className="absolute inset-0 rounded-[2.4rem] bg-linear-to-br from-white/90 to-amber-50/90 border border-amber-100 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.45)]" />
                            <div
                                className="absolute inset-0 rounded-[2.4rem] opacity-25 pointer-events-none mix-blend-multiply"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                }}
                            />

                            <div className="absolute inset-5 rounded-[1.9rem] overflow-hidden bg-slate-200">
                                <div className="absolute inset-0">
                                    <Image
                                        src={mainPhoto}
                                        alt="Community moments"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/35 via-slate-900/10 to-transparent" />
                                </div>
                            </div>

                            <div className="absolute -left-6 top-14 w-40 h-52 rounded-2xl bg-white p-2 shadow-xl border border-slate-200">
                                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-100">
                                    <Image
                                        src={sidePhotoOne}
                                        alt="Volunteer highlight"
                                        fill
                                        className="object-cover"
                                        sizes="160px"
                                    />
                                </div>
                            </div>

                            <div className="absolute -right-6 bottom-16 w-44 h-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200">
                                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-100">
                                    <Image
                                        src={sidePhotoTwo}
                                        alt="Field work highlight"
                                        fill
                                        className="object-cover"
                                        sizes="176px"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Floating accents */}
                        <div className="absolute top-1/4 right-[10%] w-6 h-6 rounded-full bg-amber-400 mix-blend-multiply blur-[2px]" />
                        <div className="absolute bottom-1/3 left-[5%] w-10 h-10 rounded-full bg-blue-300 mix-blend-multiply blur-[3px]" />
                        <div className="absolute bottom-[15%] right-[20%]">
                            <svg width="40" height="40" viewBox="0 0 100 100" className="text-amber-500/50 fill-current">
                                <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            
        </section>
    );
}

