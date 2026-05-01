"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { safeJsonParse } from "@/lib/utils";

interface NavLink {
    label: string;
    url: string;
}

interface NavbarProps {
    settings: Record<string, string>;
}

export function Navbar({ settings }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const parsedNavLinks = safeJsonParse<NavLink[]>(settings.navbar_links || "[]", []);
    const navLinks = [...parsedNavLinks];
    
    // Auto-inject Documents if missing
    if (!navLinks.some(link => link.label === "Documents")) {
        const blogIndex = navLinks.findIndex(l => l.label === "Blog");
        if (blogIndex !== -1) {
            navLinks.splice(blogIndex + 1, 0, { label: "Documents", url: "/downloads" });
        } else {
            navLinks.push({ label: "Documents", url: "/downloads" });
        }
    }
    const ctaText = settings.navbar_cta_text || "Join Us";
    const ctaLink = settings.navbar_cta_link || "/register";
    const siteName = settings.site_name || "Nirashray Foundation";

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <header
            style={{ top: "var(--announcement-height, 0px)" }}
            className={cn(
                "fixed w-full z-50 transition-all duration-500",
                isScrolled
                    ? "backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-slate-200/50 bg-[#fdfcfa]/80 py-2 md:py-0"
                    : "bg-transparent py-4 md:py-2"
            )}
        >
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="w-12 h-12 rounded-full overflow-hidden shadow-sm shrink-0 border border-white"
                        >
                            <Image src="/favicon.ico" alt="Nirashray Foundation Logo" width={48} height={48} className="w-full h-full object-cover" />
                        </motion.div>
                        <div>
                            <p className="font-serif font-bold text-slate-900 text-xl leading-tight tracking-tight group-hover:text-amber-700 transition-colors">
                                {siteName}
                            </p>
                            <p className="text-xs text-slate-500 hidden sm:block tracking-widest uppercase font-medium mt-0.5">Empowering Lives</p>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.url}
                                href={link.url}
                                className={cn(
                                    "px-4 py-2 text-[15px] font-medium transition-all duration-300 relative group",
                                    pathname === link.url
                                        ? "text-slate-900"
                                        : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {link.label}
                                {pathname === link.url && (
                                    <motion.span
                                        layoutId="nav-indicator"
                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-amber-500"
                                    />
                                )}
                                {/* Hover Indicator */}
                                <span className={cn(
                                    "absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-0.5 rounded-full bg-amber-300 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:w-4",
                                    pathname === link.url && "hidden"
                                )} />
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="link" className="text-slate-600 hover:text-slate-900 font-medium px-4">
                                Login
                            </Button>
                        </Link>
                        <Link href="/donate">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 py-5 font-bold shadow-[0_4px_14px_rgba(245,158,11,0.3)] transition-all hover:scale-105 group border-none">
                                <Heart className="w-4 h-4 mr-2 fill-white transition-transform group-hover:scale-110" />
                                Donate
                            </Button>
                        </Link>
                        <Link href={ctaLink} className="hidden lg:block">
                            <Button variant="outline" className="rounded-full px-6 py-5 font-bold text-slate-800 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all hover:scale-105 shadow-none">
                                {ctaText}
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="md:hidden bg-[#fdfcfa] border-t border-slate-200/50 shadow-2xl overflow-hidden absolute w-full"
                    >
                        <nav className="container mx-auto px-6 py-6 flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.url}
                                    href={link.url}
                                    className={cn(
                                        "px-4 py-4 rounded-xl text-base font-medium transition-all duration-300",
                                        pathname === link.url
                                            ? "bg-amber-50 text-amber-900 font-bold"
                                            : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-200/50">
                                <Link href="/login">
                                    <Button variant="outline" className="w-full rounded-full py-6 text-base border-2">Login</Button>
                                </Link>
                                <Link href="/donate">
                                    <Button className="w-full rounded-full py-6 text-base bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg">
                                        <Heart className="w-4 h-4 mr-2 fill-white" />
                                        Donate Now
                                    </Button>
                                </Link>
                                <Link href={ctaLink}>
                                    <Button className="w-full rounded-full py-6 text-base bg-slate-900 text-white font-bold">
                                        {ctaText}
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
