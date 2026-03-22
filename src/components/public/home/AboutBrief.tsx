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

    const heading = settings.about_brief_heading || "Who We Are";
    const text = settings.about_brief_text || "";
    const image = settings.about_brief_image || "/about-brief.jpg";

    if (!text) return null;

    const highlights = [
        "Registered NGO under Societies Registration Act",
        "80G Tax Exemption Certificate",
        "Fully transparent fund utilization",
        "Active across multiple communities",
    ];

    return (
        <section ref={ref} className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7 }}
                        className="relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                            <Image
                                src={image}
                                alt="About Nirashray Foundation"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-amber-100 rounded-3xl -z-10" />
                        <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full -z-10" />
                        {/* Stats badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.5 }}
                            className="absolute bottom-8 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-slate-100"
                        >
                            <p className="font-serif font-bold text-3xl text-blue-800">10+</p>
                            <p className="text-xs text-slate-500">Years of Impact</p>
                        </motion.div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">
                            Our Story
                        </p>
                        <h2 className="font-serif text-4xl font-bold text-slate-900 mb-6 leading-tight">
                            {heading}
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                            {text}
                        </p>

                        {/* Highlights */}
                        <ul className="space-y-3 mb-8">
                            {highlights.map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="text-slate-600 text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href="/about">
                            <Button className="bg-blue-800 hover:bg-blue-900 text-white">
                                Learn More About Us
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
