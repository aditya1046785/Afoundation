"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    photo: string;
    category: string;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    twitterUrl?: string | null;
    linkedinUrl?: string | null;
}

interface TeamPreviewProps {
    settings: Record<string, string>;
    members: TeamMember[];
}

export function TeamPreview({ settings, members }: TeamPreviewProps) {
    const heading = settings.team_section_heading || "Meet Our Team";
    const subtext = settings.team_section_subtext || "The passionate people behind our mission";

    const socialIcons = [
        { key: "instagramUrl", Icon: Instagram },
        { key: "facebookUrl", Icon: Facebook },
        { key: "twitterUrl", Icon: Twitter },
        { key: "linkedinUrl", Icon: Linkedin },
    ] as const;

    return (
        <section className="py-24 bg-[#fffdfa] relative overflow-hidden">
            {/* Soft paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.2] pointer-events-none mix-blend-multiply"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />
            {/* Artistic Paint Splash */}
            <motion.div 
                animate={{ rotate: -360, scale: [1, 1.1, 1] }} 
                transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-100/40 rounded-full mix-blend-multiply filter blur-[90px] pointer-events-none"
            />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">Our People</p>
                    <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-800 mb-6 tracking-tight relative inline-block">
                        {heading}
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto font-light text-lg">{subtext}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {members.map((member, idx) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className={`group relative flex-col items-center ${idx >= 3 ? "hidden md:flex" : "flex"}`}
                        >
                            {/* Photo with artistic portrait framing */}
                            <div className="aspect-[3/4] w-full relative bg-slate-100 rounded-[2rem_1rem_3rem_1rem] overflow-hidden mb-6 shadow-md transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] group-hover:rounded-[1rem_3rem_1rem_2rem]">
                                {member.photo ? (
                                    <Image
                                        src={member.photo}
                                        alt={member.name}
                                        fill
                                        className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#fdfcfa]">
                                        <span className="font-serif font-bold text-4xl text-amber-200">
                                            {getInitials(member.name)}
                                        </span>
                                    </div>
                                )}
                                {/* Elegant Social overlay */}
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    {socialIcons.map(({ key, Icon }) =>
                                        member[key] ? (
                                            <a
                                                key={key}
                                                href={member[key]!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-slate-900 flex items-center justify-center transition-all duration-300 border border-white/40 hover:border-amber-400 group/icon"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Icon className="w-4 h-4 text-white group-hover/icon:text-amber-400" />
                                            </a>
                                        ) : null
                                    )}
                                </div>
                            </div>

                            {/* Info Component */}
                            <div className="text-center w-full">
                                <p className="font-serif font-bold text-slate-900 text-xl tracking-wide mb-1 transition-colors group-hover:text-amber-700">{member.name}</p>
                                <p className="text-amber-600 text-sm font-medium tracking-widest uppercase">{member.role}</p>
                                <div className="w-12 h-[1px] bg-slate-200 mx-auto my-3 group-hover:w-full group-hover:bg-amber-300 transition-all duration-500" />
                                <span className="inline-block text-xs text-slate-400 italic">"{member.category}"</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-20">
                    <Link href="/team">
                        <Button variant="ghost" className="rounded-full px-8 py-6 text-base font-medium text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 group shadow-none">
                            Meet The Full Team
                            <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
