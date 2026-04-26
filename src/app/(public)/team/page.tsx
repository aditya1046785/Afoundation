export const dynamic = "force-dynamic";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { getInitials } from "@/lib/utils";
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

export const metadata: Metadata = {
    title: "Our Team",
    description: "Meet the passionate people behind Nirashray Foundation.",
};

interface TeamMemberType {
    id: string; name: string; role: string; bio: string | null;
    photo: string; category: string; displayOrder: number;
    instagramUrl: string | null; facebookUrl: string | null;
    twitterUrl: string | null; linkedinUrl: string | null; youtubeUrl: string | null;
    [key: string]: string | number | null | boolean;
}

function getSafeImageSrc(src: string | null): string | null {
    if (!src) return null;

    const value = src.trim();
    if (!value) return null;

    // Accept root-relative local assets.
    if (value.startsWith("/")) return value;

    // Accept valid absolute http(s) URLs only.
    try {
        const parsed = new URL(value);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return value;
        }
        return null;
    } catch {
        return null;
    }
}

export default async function TeamPage() {
    const members: TeamMemberType[] = await prisma.teamMember.findMany({
        where: { isVisible: true },
        orderBy: [{ displayOrder: "asc" }],
    }) as any;

    // Group by category but maintain order of appearance
    const categories = [...new Set(members.map((m: TeamMemberType) => m.category))];

    const socialLinks = [
        { key: "instagramUrl" as const, Icon: Instagram },
        { key: "facebookUrl" as const, Icon: Facebook },
        { key: "twitterUrl" as const, Icon: Twitter },
        { key: "linkedinUrl" as const, Icon: Linkedin },
        { key: "youtubeUrl" as const, Icon: Youtube },
    ];

    const membersWithSafePhoto = members.map((member) => ({
        ...member,
        safePhoto: getSafeImageSrc(member.photo),
    }));

    return (
        <div className="min-h-screen bg-[#fdfcfa] relative overflow-hidden font-light pt-20">
            {/* Subtle global paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply fixed"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Banner Section */}
            <div className="relative py-24 text-center border-b border-amber-200/40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-amber-50/60 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />
                
                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">
                        The People
                    </p>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-slate-800 tracking-tight relative inline-block">
                        Our Team
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h1>
                    <p className="text-slate-500 text-xl font-light max-w-2xl mx-auto leading-relaxed mt-4">
                        Meet the passionate individuals driving our mission forward, changing lives one day at a time.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl py-20 relative z-10">
                {categories.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 rounded-[2rem] border border-white/50 backdrop-blur-sm max-w-3xl mx-auto">
                        <Instagram className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-light text-lg">Our team roster is currently being updated.</p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <div key={category} className="mb-24 last:mb-10">
                            {/* Elegant Category Header */}
                            <div className="flex items-center gap-6 mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 tracking-tight whitespace-nowrap">{category}</h2>
                                <div className="h-px w-full bg-gradient-to-r from-amber-200 to-transparent flex-1 mt-2" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                                {membersWithSafePhoto.filter(m => m.category === category).map((member) => (
                                    <div key={member.id} className="group relative">
                                        {/* Minimalist Asymmetrical Portrait Frame */}
                                        <div className="relative pl-6 pb-6">
                                            {/* Decorative Background Frame */}
                                            <div className="absolute top-6 left-0 right-6 bottom-0 bg-amber-50/50 rounded-2xl transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
                                            
                                            <div className="relative aspect-[4/5] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden border border-white z-10 group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                                                {member.safePhoto ? (
                                                    <Image src={member.safePhoto} alt={member.name} fill className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-amber-50/30">
                                                        <span className="font-serif font-bold text-5xl text-amber-200">{getInitials(member.name)}</span>
                                                    </div>
                                                )}
                                                
                                                {/* Glassmorphism Social Overlay */}
                                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3">
                                                    {socialLinks.map(({ key, Icon }) =>
                                                        member[key] ? (
                                                            <a key={key} href={member[key]!} target="_blank" rel="noopener noreferrer"
                                                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/90 hover:scale-110 flex items-center justify-center transition-all duration-300 group/icon">
                                                                <Icon className="w-4 h-4 text-white group-hover/icon:text-amber-700 transition-colors" />
                                                            </a>
                                                        ) : null
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Text Info */}
                                        <div className="pt-6 pl-4 border-l border-amber-200/40 group-hover:border-amber-400 transition-colors duration-500 relative z-10 ml-6">
                                            <h3 className="font-serif font-bold text-2xl text-slate-800 tracking-tight group-hover:text-amber-700 transition-colors">{member.name}</h3>
                                            <p className="text-amber-600 font-medium tracking-widest uppercase text-xs mt-2 relative inline-block">
                                                {member.role}
                                            </p>
                                            {member.bio && (
                                                <p className="text-slate-500 text-sm mt-4 font-light leading-relaxed line-clamp-3 group-hover:text-slate-600 transition-colors">{member.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
