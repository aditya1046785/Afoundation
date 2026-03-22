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
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Our People</p>
                    <h2 className="font-serif text-4xl font-bold text-slate-900 mb-4">{heading}</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">{subtext}</p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {members.map((member, idx) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Photo */}
                            <div className="aspect-square relative bg-slate-100">
                                {member.photo ? (
                                    <Image
                                        src={member.photo}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                        <span className="font-serif font-bold text-3xl text-blue-300">
                                            {getInitials(member.name)}
                                        </span>
                                    </div>
                                )}
                                {/* Social overlay */}
                                <div className="absolute inset-0 bg-blue-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {socialIcons.map(({ key, Icon }) =>
                                        member[key] ? (
                                            <a
                                                key={key}
                                                href={member[key]!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white flex items-center justify-center transition-colors group/icon"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Icon className="w-3.5 h-3.5 text-white group-hover/icon:text-blue-800" />
                                            </a>
                                        ) : null
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <p className="font-semibold text-slate-900 text-sm leading-tight">{member.name}</p>
                                <p className="text-blue-700 text-xs mt-0.5">{member.role}</p>
                                <span className="inline-block mt-1 text-xs text-slate-400">{member.category}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <Link href="/team">
                        <Button variant="outline" className="border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white">
                            View All Team Members
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
