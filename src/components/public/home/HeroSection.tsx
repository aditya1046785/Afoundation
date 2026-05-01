"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

interface HeroProps {
    settings: Record<string, string>;
}

export function HeroSection({ settings }: HeroProps) {
    const badgeText = settings.hero_badge_text || "The Art of Giving";
    const heading = settings.hero_heading || "Nirashray Foundation";
    const subheading = settings.hero_subheading || "Empowering Lives, Building Hope";
    const descriptionSuffix = settings.hero_description_suffix || "Every life we touch adds a new, beautiful color to the canvas of humanity.";
    const cta1Text = settings.hero_cta1_text || "Donate Now";
    const cta1Link = settings.hero_cta1_link || "/donate";
    const cta2Text = settings.hero_cta2_text || "Join Us";
    const cta2Link = settings.hero_cta2_link || "/register";

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
                <div className="max-w-4xl pt-14 min-[900px]:pt-4">
                    
                    {/* Editorial Typography */}
                    <div className="flex flex-col justify-center text-left">
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
                </div>
            </div>
            
        </section>
    );
}
