"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

interface HeroProps {
    settings: Record<string, string>;
    galleryImages: string[];
}

export function HeroSection({ settings, galleryImages }: HeroProps) {
    const badgeText = settings.hero_badge_text || "The Art of Giving";
    const heading = settings.hero_heading || "Nirashray Foundation";
    const subheading = settings.hero_subheading || "Empowering Lives, Building Hope";
    const descriptionSuffix = settings.hero_description_suffix || "Every life we touch adds a new, beautiful color to the canvas of humanity.";
    const cta1Text = settings.hero_cta1_text || "Donate Now";
    const cta1Link = settings.hero_cta1_link || "/donate";
    const cta2Text = settings.hero_cta2_text || "Join Us";
    const cta2Link = settings.hero_cta2_link || "/register";
    const fallbackHeroImage = settings.hero_image || "/hero-bg.jpg";
    const rotatingPhotos = galleryImages.length > 0 ? galleryImages : [fallbackHeroImage];
    const shufflePhotos = useCallback((photos: string[]) => {
        const shuffled = [...photos];
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    const [photoQueue, setPhotoQueue] = useState<string[]>(() => shufflePhotos(rotatingPhotos));
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    useEffect(() => {
        const shuffled = shufflePhotos(rotatingPhotos);
        setPhotoQueue(shuffled);
        setActivePhotoIndex(0);
    }, [rotatingPhotos, shufflePhotos]);

    useEffect(() => {
        if (photoQueue.length <= 1) return;

        const rotationTimer = setInterval(() => {
            setActivePhotoIndex((prev) => {
                if (prev < photoQueue.length - 1) {
                    return prev + 1;
                }

                setPhotoQueue((currentQueue) => {
                    const reshuffled = shufflePhotos(currentQueue);
                    if (reshuffled.length > 1 && reshuffled[0] === currentQueue[currentQueue.length - 1]) {
                        [reshuffled[0], reshuffled[1]] = [reshuffled[1], reshuffled[0]];
                    }
                    return reshuffled;
                });

                return 0;
            });
        }, 4500);

        return () => clearInterval(rotationTimer);
    }, [photoQueue.length, shufflePhotos]);

    const sidePhotoOne = photoQueue[(activePhotoIndex + 1) % photoQueue.length];
    const sidePhotoTwo = photoQueue[(activePhotoIndex + 2) % photoQueue.length];

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fbfaf8]">
            {/* Artistic Canvas Paper Texture */}
            <div 
                className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Delicate Watercolor Splatter / Blobs in the background */}
            <motion.div 
                animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-amber-100/40 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none"
            />
            <motion.div 
                animate={{ rotate: -360, scale: [1, 1.1, 1] }} 
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-[30%] -right-[15%] w-[700px] h-[700px] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"
            />

            <div className="relative z-10 container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Content Column (The Editorial Typography) */}
                    <div className="lg:col-span-6 flex flex-col justify-center text-left pt-20 lg:pt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <p className="font-serif italic text-amber-600 text-xl md:text-2xl mb-4 tracking-wide">
                                {badgeText}
                            </p>
                            
                            {/* Artistic Headline */}
                            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-slate-800 leading-[1.1] tracking-tight">
                                {heading.split(' ').map((word, i, arr) => (
                                    <span key={i} className="inline-block relative">
                                        {word}
                                        {i !== arr.length - 1 && <span>&nbsp;</span>}
                                        {/* Golden Underline for emphasis on the first word */}
                                        {i === 0 && (
                                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-400 stroke-current" viewBox="0 0 100 10" preserveAspectRatio="none">
                                                <path d="M0,5 Q50,-5 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </span>
                                ))}
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-lg md:text-xl text-slate-500 mt-8 max-w-lg leading-relaxed font-light"
                        >
                            {subheading} {descriptionSuffix}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col sm:flex-row gap-6 mt-12"
                        >
                            {/* Artistic CTA 1 */}
                            <Link href={cta1Link}>
                                <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-7 text-lg font-medium tracking-wide transition-all duration-300 hover:scale-105 group border border-transparent hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
                                    {cta1Text}
                                    <Heart className="w-4 h-4 ml-3 fill-amber-400 text-amber-400 transition-transform group-hover:scale-110" />
                                </Button>
                            </Link>
                            
                            {/* Artistic CTA 2 */}
                            <Link href={cta2Link}>
                                <Button variant="ghost" className="w-full sm:w-auto rounded-full px-8 py-7 text-lg font-medium tracking-wide text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 group">
                                    {cta2Text}
                                    <ArrowRight className="w-4 h-4 ml-2 opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right Content Column (Authentic Framed Collage) */}
                    <div className="hidden lg:flex lg:col-span-6 relative justify-center lg:justify-end pb-20 lg:pb-0 h-[50vh] lg:h-[80vh] w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full h-full max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto"
                        >
                            <div className="absolute inset-0 rounded-[2.4rem] bg-gradient-to-br from-white/90 to-amber-50/90 border border-amber-100 shadow-[0_25px_70px_-30px_rgba(15,23,42,0.45)]" />
                            <div
                                className="absolute inset-0 rounded-[2.4rem] opacity-25 pointer-events-none mix-blend-multiply"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                }}
                            />

                            <div className="absolute inset-5 rounded-[1.9rem] overflow-hidden bg-slate-200">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={photoQueue[activePhotoIndex]}
                                        initial={{ opacity: 0, scale: 1.08 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={photoQueue[activePhotoIndex]}
                                            alt="Community moments"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/10 to-transparent" />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <motion.div
                                animate={{ y: [0, -8, 0], rotate: [-5, -3, -5] }}
                                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -left-6 top-14 w-40 h-52 rounded-2xl bg-white p-2 shadow-xl border border-slate-200"
                            >
                                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-100">
                                    <Image
                                        src={sidePhotoOne}
                                        alt="Volunteer highlight"
                                        fill
                                        className="object-cover"
                                        sizes="160px"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 7, 0], rotate: [6, 4, 6] }}
                                transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-6 bottom-16 w-44 h-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200"
                            >
                                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-100">
                                    <Image
                                        src={sidePhotoTwo}
                                        alt="Field work highlight"
                                        fill
                                        className="object-cover"
                                        sizes="176px"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Floating accents */}
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                            className="absolute top-1/4 right-[10%] w-6 h-6 rounded-full bg-amber-400 mix-blend-multiply blur-[2px]"
                        />
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, x: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, delay: 1.5 }}
                            className="absolute bottom-1/3 left-[5%] w-10 h-10 rounded-full bg-blue-300 mix-blend-multiply blur-[3px]"
                        />
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8, rotate: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                            className="absolute bottom-[15%] right-[20%]"
                        >
                            <svg width="40" height="40" viewBox="0 0 100 100" className="text-amber-500/50 fill-current">
                                <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"/>
                            </svg>
                        </motion.div>
                    </div>
                </div>
            </div>
            
        </section>
    );
}

