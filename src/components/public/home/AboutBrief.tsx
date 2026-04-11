"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface AboutBriefProps {
    settings: Record<string, string>;
}

export function AboutBrief({ settings }: AboutBriefProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    const eyebrow = settings.about_brief_eyebrow || "Our Story";
    const heading = settings.about_brief_heading || "Who We Are";
    const text = settings.about_brief_text || "";
    const image = settings.about_brief_image || "/about-brief.jpg";
    const ctaText = settings.about_brief_cta_text || "Learn More About Us";
    const ctaLink = settings.about_brief_cta_link || "/about";

    if (!text) return null;

    const highlights = (settings.about_brief_highlights || "Registered NGO under Societies Registration Act\n80G Tax Exemption Certificate\nFully transparent fund utilization\nActive across multiple communities")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <section ref={ref} className="py-32 bg-[#fffdfa] relative overflow-hidden">
            {/* Delicate Watercolor Splash in BG */}
            <motion.div 
                animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] bg-amber-100/30 rounded-full mix-blend-multiply filter blur-[90px] pointer-events-none"
            />
            
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
                    
                    {/* Artistic Image Mask */}
                    <div className="relative w-full flex justify-center lg:justify-start">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                            animate={isInView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full aspect-square max-w-md mx-auto lg:mx-0 lg:max-w-[500px]"
                            style={{
                                /* Organic blob SVG mask */
                                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M39.6,-66.6C52.4,-57.4,64.8,-47.9,73.1,-35.1C81.4,-22.4,85.6,-6.4,84.1,9.4C82.7,25.3,75.6,41,64.2,52C52.9,63.1,37.3,69.5,21.9,73.8C6.6,78.2,-8.6,80.6,-22.8,77C-37,73.4,-50.2,63.8,-61.6,51.8C-73,39.9,-82.6,25.6,-86.3,10C-90.1,-5.5,-88,-22.3,-79.6,-36.1C-71.1,-49.9,-56.3,-60.7,-41.8,-69.1C-27.4,-77.6,-13.7,-83.8,-0.2,-83.4C13.2,-83.1,26.8,-75.9,39.6,-66.6Z' transform='translate(100 100)' /%3E%3C/svg%3E")`,
                                WebkitMaskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                                maskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M39.6,-66.6C52.4,-57.4,64.8,-47.9,73.1,-35.1C81.4,-22.4,85.6,-6.4,84.1,9.4C82.7,25.3,75.6,41,64.2,52C52.9,63.1,37.3,69.5,21.9,73.8C6.6,78.2,-8.6,80.6,-22.8,77C-37,73.4,-50.2,63.8,-61.6,51.8C-73,39.9,-82.6,25.6,-86.3,10C-90.1,-5.5,-88,-22.3,-79.6,-36.1C-71.1,-49.9,-56.3,-60.7,-41.8,-69.1C-27.4,-77.6,-13.7,-83.8,-0.2,-83.4C13.2,-83.1,26.8,-75.9,39.6,-66.6Z' transform='translate(100 100)' /%3E%3C/svg%3E")`,
                                maskSize: "contain",
                                maskRepeat: "no-repeat",
                                maskPosition: "center"
                            }}
                        >
                            <motion.div 
                                className="w-full h-full relative"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                <Image
                                    src={image}
                                    alt="About Nirashray Foundation"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Content Editorial Layout */}
                    <div className="pl-0 lg:pl-4">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        >
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
                        </motion.div>

                        {/* Elegantly styled Highlights */}
                        <ul className="space-y-4 mb-10">
                            {highlights.map((item, index) => (
                                <motion.li 
                                    key={item} 
                                    className="flex items-center gap-4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                        <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <span className="text-slate-600 font-medium tracking-wide text-sm">{item}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <Link href={ctaLink}>
                                <Button variant="ghost" className="rounded-full px-8 py-6 text-base font-medium text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 group shadow-none">
                                    {ctaText}
                                    <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
