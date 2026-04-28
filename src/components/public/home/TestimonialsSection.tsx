"use client";

import { useState } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { getInitials } from "@/lib/utils";

interface TestimonialsProps {
    settings: Record<string, string>;
}

export function TestimonialsSection({ settings }: TestimonialsProps) {
    const [current, setCurrent] = useState(0);
    const eyebrow = settings.testimonials_eyebrow || "Testimonials";
    const heading = settings.testimonials_heading || "What People Say";

    const testimonials = [1, 2, 3].map((i) => ({
        name: settings[`testimonial${i}_name`] || "",
        designation: settings[`testimonial${i}_designation`] || "",
        quote: settings[`testimonial${i}_quote`] || "",
        image: settings[`testimonial${i}_image`] || "",
    })).filter((t) => t.name && t.quote);

    if (!testimonials.length) return null;

    const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
    const next = () => setCurrent((c) => (c + 1) % testimonials.length);
    const active = testimonials[current];

    return (
        <section className="py-20 md:py-24 bg-[#fffcf8] relative overflow-hidden">
            {/* Soft paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />
            
            {/* Massive background Quote Icon decoration */}
            <Quote className="absolute top-[20%] left-[10%] w-100 h-100 text-amber-100/40 -rotate-12 pointer-events-none stroke-[0.5]" />

            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                <div className="text-center mb-16">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">{eyebrow}</p>
                    <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-800 relative inline-block">
                        {heading}
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h2>
                </div>

                <div className="relative">
                    <div className="text-center px-4 md:px-12">
                            <p className="text-slate-700 text-2xl md:text-4xl font-serif italic leading-relaxed mb-10 text-balance max-w-4xl mx-auto font-light">
                                &ldquo;{active.quote}&rdquo;
                            </p>

                            {/* Elegant Stars */}
                            <div className="flex justify-center gap-2 mb-8">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                                ))}
                            </div>

                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#fdfcfa] border border-amber-200 shadow-lg p-1">
                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                        {active.image ? (
                                            <Image
                                                src={active.image}
                                                alt={active.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xl bg-slate-100">
                                                {getInitials(active.name)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="font-serif font-bold text-slate-800 text-xl mb-1">{active.name}</p>
                                    <p className="text-slate-500 text-sm tracking-widest uppercase font-medium">{active.designation}</p>
                                </div>
                            </div>
                    </div>

                    {/* Navigation */}
                    {testimonials.length > 1 && (
                        <div className="flex justify-center gap-6 mt-16 items-center">
                            <button
                                onClick={prev}
                                className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-800 hover:bg-slate-800 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-300"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex gap-3">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrent(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-500 ${i === current ? "w-8 bg-amber-500" : "bg-slate-200 hover:bg-slate-300"}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={next}
                                className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-800 hover:bg-slate-800 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-300"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
