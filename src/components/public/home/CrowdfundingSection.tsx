"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, HandHeart, Sparkles } from "lucide-react";

interface Campaign {
    id: string;
    title: string;
    description: string;
    target: number;
    raised: number;
    image: string;
    category: string;
}

interface CrowdfundingProps {
    campaigns: Campaign[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export function CrowdfundingSection({ campaigns }: CrowdfundingProps) {
    if (!campaigns || campaigns.length === 0) return null;

    return (
        <section className="py-24 lg:py-32 bg-[#FAF7F2] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-50/50 to-transparent pointer-events-none" />
            <div className="absolute -bottom-[20%] -left-[10%] w-150 h-150 bg-rose-100/30 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" /> Active Campaigns
                        </p>
                        <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-800 mb-6 tracking-tight relative inline-block">
                            Fund the Change
                            <svg className="absolute -bottom-2 lg:-bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </h2>
                        <p className="text-slate-500 font-light text-lg">
                            Your support directly impacts lives. Explore our ongoing crowdfunding campaigns and help us reach our target to create sustainable change.
                        </p>
                    </div>
                    
                    <div className="shrink-0">
                        <Link href="/donate">
                            <Button className="rounded-full px-8 py-6 text-base font-medium bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-xl shadow-slate-900/10 group">
                                View All Campaigns
                                <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Campaign Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {campaigns.map((campaign, idx) => {
                        const progress = Math.min(100, Math.round((campaign.raised / campaign.target) * 100));
                        
                        return (
                            <div
                                key={campaign.id}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col h-full"
                            >
                                {/* Image Container */}
                                <div className="relative h-56 w-full overflow-hidden">
                                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors duration-500 z-10" />
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={campaign.image}
                                        alt={campaign.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-amber-700 shadow-sm">
                                        {campaign.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-serif text-xl font-bold text-slate-800 mb-3 group-hover:text-amber-600 transition-colors">
                                        {campaign.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-light flex-1">
                                        {campaign.description}
                                    </p>

                                    {/* Elaborate Artistic Progress Bar */}
                                    <div className="mt-auto">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Raised</p>
                                                <p className="text-lg font-bold text-slate-800">{formatCurrency(campaign.raised)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Goal</p>
                                                <p className="text-sm font-semibold text-slate-500">{formatCurrency(campaign.target)}</p>
                                            </div>
                                        </div>

                                        {/* Unique Progress Bar Design */}
                                        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden mt-3 mb-2 shadow-inner">
                                            {/* Animated liquid fill */}
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs font-bold text-amber-600">{progress}% Funded</span>
                                            
                                            <Link
                                                href={{
                                                    pathname: "/donate",
                                                    query: {
                                                        campaign: campaign.id,
                                                        campaignTitle: campaign.title,
                                                    },
                                                }}
                                                className="inline-flex items-center justify-center"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                                    <HandHeart className="w-4 h-4" />
                                                </div>
                                            </Link>
                                        </div>
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
