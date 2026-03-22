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

export default async function TeamPage() {
    const members: TeamMemberType[] = await prisma.teamMember.findMany({
        where: { isVisible: true },
        orderBy: [{ displayOrder: "asc" }],
    }) as any;

    // Group by category
    const categories = [...new Set(members.map((m: TeamMemberType) => m.category))];

    const socialLinks = [
        { key: "instagramUrl" as const, Icon: Instagram },
        { key: "facebookUrl" as const, Icon: Facebook },
        { key: "twitterUrl" as const, Icon: Twitter },
        { key: "linkedinUrl" as const, Icon: Linkedin },
        { key: "youtubeUrl" as const, Icon: Youtube },
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="font-serif text-4xl font-bold mb-3">Our Team</h1>
                    <p className="text-blue-200">The passionate people driving our mission forward</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-12">
                {categories.length === 0 ? (
                    <p className="text-center text-slate-400 py-20">No team members added yet.</p>
                ) : (
                    categories.map((category) => (
                        <div key={category} className="mb-14">
                            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">{category}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {members.filter(m => m.category === category).map((member) => (
                                    <div key={member.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div className="aspect-square relative bg-slate-100">
                                            {member.photo ? (
                                                <Image src={member.photo} alt={member.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                                    <span className="font-serif font-bold text-3xl text-blue-300">{getInitials(member.name)}</span>
                                                </div>
                                            )}
                                            {/* Social overlay */}
                                            <div className="absolute inset-0 bg-blue-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {socialLinks.map(({ key, Icon }) =>
                                                    member[key] ? (
                                                        <a key={key} href={member[key]!} target="_blank" rel="noopener noreferrer"
                                                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white flex items-center justify-center transition-colors group/icon">
                                                            <Icon className="w-3.5 h-3.5 text-white group-hover/icon:text-blue-800" />
                                                        </a>
                                                    ) : null
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                                            <p className="text-blue-700 text-xs mt-0.5">{member.role}</p>
                                            {member.bio && <p className="text-slate-500 text-xs mt-2 line-clamp-2">{member.bio}</p>}
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
