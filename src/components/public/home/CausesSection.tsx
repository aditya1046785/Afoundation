"use client";

import Link from "next/link";
import { GraduationCap, HeartPulse, Users, Heart, Home, Leaf, BookOpen, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="py-16 md:py-20 bg-[#fdfcfa] relative overflow-hidden"
        >
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
                <div className="text-center mb-12 md:mb-16">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">
                        {eyebrow}
                    </p>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 tracking-tight relative inline-block">
                        {heading}
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h2>
                    <p className="text-slate-600 max-w-xl mx-auto font-light text-base md:text-lg">
                        {subtext}
                    </p>
                </div>
                <div className="overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex flex-nowrap gap-4 lg:gap-6 min-w-max">
                    {causes.map((cause, idx) => {
                        const IconComponent = ICON_MAP[cause.icon] || Heart;
                        return (
                            <div
                                key={idx}
                                className="relative group cursor-pointer flex-none w-64 sm:w-72 lg:w-80"
                            >
                                {/* 01, 02, 03 Massive Background Number */}
                                <div className="absolute -top-12 -left-6 font-serif text-7xl md:text-8xl font-bold text-slate-100 opacity-50 select-none group-hover:-translate-y-2 transition-transform duration-500">
                                    0{idx + 1}
                                </div>
                                
                                <motion.div whileHover={{ y: -4 }} className="relative z-10 bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-400 hover:shadow-[0_10px_38px_rgb(0,0,0,0.06)] hover:bg-white/80">
                                    <div className="w-14 h-14 rounded-full bg-[#fdfcfa] border border-amber-100 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-amber-50 transition-all duration-500">
                                        <IconComponent className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-slate-800 mb-4">{cause.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-light mb-8">{cause.description}</p>
                                    
                                    <Link
                                        href={{
                                            pathname: "/donate",
                                            query: { purpose: cause.title },
                                        }}
                                        className="inline-flex items-center text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
                                    >
                                        {cardCtaText}
                                        <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                    </Link>
                                </motion.div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
