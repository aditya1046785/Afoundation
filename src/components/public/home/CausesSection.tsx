"use client";

import { GraduationCap, HeartPulse, Users, Heart, Home, Leaf, BookOpen, Star, ArrowRight } from "lucide-react";

interface CausesProps {
    settings: Record<string, string>;
}

const ICON_MAP: Record<string, React.ElementType> = {
    GraduationCap, HeartPulse, Users, Heart, Home, Leaf, BookOpen, Star,
};

export function CausesSection({ settings }: CausesProps) {
    const eyebrow = settings.causes_eyebrow || "What We Do";
    const heading = settings.causes_heading || "Our Canvas of Impact";
    const subtext = settings.causes_subtext || "We focus on three core pillars that drive sustainable change in communities, approaching every challenge with heart.";
    const cardCtaText = settings.causes_card_cta_text || "Support This Cause";

    const causes = [1, 2, 3].map((i) => ({
        icon: settings[`cause${i}_icon`] || "Heart",
        title: settings[`cause${i}_title`] || "",
        description: settings[`cause${i}_description`] || "",
    })).filter((c) => c.title);

    if (!causes.length) return null;

    return (
        <section className="py-32 bg-[#fdfcfa] relative overflow-hidden">
            {/* Very faint background noise */}
            <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Subtle watercolor blob */}
            <div className="absolute top-[20%] -right-[10%] w-150 h-150 bg-blue-100/30 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-24">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">
                        {eyebrow}
                    </p>
                    <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-800 mb-6 tracking-tight relative inline-block">
                        {heading}
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto font-light text-lg">
                        {subtext}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                    {causes.map((cause, idx) => {
                        const IconComponent = ICON_MAP[cause.icon] || Heart;
                        return (
                            <div
                                key={idx}
                                className="relative group cursor-pointer"
                            >
                                {/* 01, 02, 03 Massive Background Number */}
                                <div className="absolute -top-12 -left-6 font-serif text-8xl md:text-9xl font-bold text-slate-100 opacity-50 select-none group-hover:-translate-y-2 transition-transform duration-500">
                                    0{idx + 1}
                                </div>
                                
                                <div className="relative z-10 bg-white/40 backdrop-blur-md p-10 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-white/80">
                                    <div className="w-14 h-14 rounded-full bg-[#fdfcfa] border border-amber-100 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-amber-50 transition-all duration-500">
                                        <IconComponent className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-slate-800 mb-4">{cause.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-light mb-8">{cause.description}</p>
                                    
                                    <div className="flex items-center text-sm font-medium text-amber-600 transition-colors">
                                        {cardCtaText}
                                        <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
