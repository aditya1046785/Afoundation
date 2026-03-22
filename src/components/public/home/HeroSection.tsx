"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown, Users } from "lucide-react";

interface HeroProps {
    settings: Record<string, string>;
}

export function HeroSection({ settings }: HeroProps) {
    const heading = settings.hero_heading || "Nirashray Foundation";
    const subheading = settings.hero_subheading || "Empowering Lives, Building Hope";
    const cta1Text = settings.hero_cta1_text || "Donate Now";
    const cta1Link = settings.hero_cta1_link || "/donate";
    const cta2Text = settings.hero_cta2_text || "Join Us";
    const cta2Link = settings.hero_cta2_link || "/register";
    const heroImage = settings.hero_image || "/hero-bg.jpg";

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${heroImage})` }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 gradient-hero" />
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-amber-400/60"
                        animate={{
                            y: ["100vh", "-10vh"],
                            x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: Math.random() * 8 + 6,
                            repeat: Infinity,
                            delay: Math.random() * 4,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center text-white">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6"
                >
                    <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
                    Registered NGO under Societies Registration Act
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                >
                    {heading}
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
                >
                    {subheading}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href={cta1Link}>
                        <Button
                            size="lg"
                            className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-6 text-lg shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <Heart className="w-5 h-5 mr-2 fill-white" />
                            {cta1Text}
                        </Button>
                    </Link>
                    <Link href={cta2Link}>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-blue-900 font-bold px-8 py-6 text-lg backdrop-blur-sm bg-white/10 transition-all hover:-translate-y-0.5"
                        >
                            <Users className="w-5 h-5 mr-2" />
                            {cta2Text}
                        </Button>
                    </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-10 flex flex-wrap gap-4 justify-center"
                >
                    {["80G Tax Benefits", "100% Transparent", "Secure Payments"].map((badge) => (
                        <span
                            key={badge}
                            className="text-xs text-white/70 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full"
                        >
                            ✓ {badge}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Scroll down indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
            >
                <ChevronDown className="w-6 h-6" />
            </motion.div>
        </section>
    );
}
