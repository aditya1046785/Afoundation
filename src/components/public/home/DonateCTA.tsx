"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";

interface DonateCTAProps {
    settings: Record<string, string>;
}

export function DonateCTA({ settings }: DonateCTAProps) {
    const eyebrow = settings.donate_cta_eyebrow || "Join Our Mission";
    const heading = settings.donate_cta_heading || "Make a Difference Today";
    const subtext = settings.donate_cta_subtext || "Every contribution, no matter how small, brings hope to someone in need.";
    const donateButtonText = settings.donate_cta_button_text || "Donate Now";
    const trustText = settings.donate_cta_trust_text || "Tax benefits under 80G of Income Tax Act • Secure payment via Razorpay";
    const presetAmounts = (settings.donate_amounts || "500,1000,2000,5000")
        .split(",")
        .map((amount) => amount.trim())
        .filter(Boolean);

    return (
        <section className="py-20 md:py-24 lg:py-28 relative overflow-hidden bg-[#0f172a]">
            {/* Soft dark paper noise overlay */}
            <div 
                className="absolute inset-0 opacity-[0.3] pointer-events-none mix-blend-overlay"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />
            {/* Background glowing artistic decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen">
                <div className="absolute -top-32 -right-32 w-150 h-150 rounded-full bg-amber-500/10 filter blur-[100px]" />
                <div className="absolute -bottom-32 -left-32 w-150 h-150 rounded-full bg-blue-500/10 filter blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
                <div>
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                        <Heart className="w-6 h-6 text-amber-400 fill-amber-400/50" />
                    </div>
                    
                    <p className="font-serif italic text-amber-500 text-xl tracking-wide mb-4">
                        {eyebrow}
                    </p>
                    <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                        {heading}
                    </h2>
                    <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        {subtext}
                    </p>

                    {/* Elegant Preset amounts */}
                    <div className="flex flex-wrap gap-4 justify-center mb-12">
                        {presetAmounts.map((amount) => (
                            <Link key={amount} href={`/donate?amount=${amount}`}>
                                <button className="bg-slate-800/40 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-full transition-all duration-300 text-lg shadow-none hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                                    ₹{parseInt(amount).toLocaleString("en-IN")}
                                </button>
                            </Link>
                        ))}
                        <Link href="/donate">
                            <button className="bg-transparent hover:bg-slate-800/60 border-2 border-slate-700 hover:border-slate-500 text-slate-400 font-medium px-8 py-4 rounded-full transition-all duration-300 text-lg">
                                Custom ₹
                            </button>
                        </Link>
                    </div>

                    <Link href="/donate">
                        <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full px-12 py-8 text-xl font-bold transition-all duration-300 hover:scale-105 group border-none shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
                            <Heart className="w-5 h-5 mr-3 fill-slate-900 transition-transform group-hover:scale-110" />
                            {donateButtonText}
                            <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>

                    <p className="mt-8 text-sm text-slate-500 tracking-wide font-light">
                        {trustText}
                    </p>
                </div>
            </div>
        </section>
    );
}
