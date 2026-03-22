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

    const navLinks = safeJsonParse<NavLink[]>(settings.navbar_links || "[]", []);
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
            className={cn(
                "sticky top-0 z-50 transition-all duration-300",
                isScrolled
                    ? "backdrop-blur-navbar shadow-lg border-b border-white/10"
                    : "bg-transparent"
            )}
        >
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-10 h-10 rounded-full overflow-hidden shadow-lg shrink-0"
                        >
                            <Image src="/favicon.ico" alt="Nirashray Foundation Logo" width={40} height={40} className="w-full h-full object-cover" />
                        </motion.div>
                        <div>
                            <p className="font-serif font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-800 transition-colors">
                                {siteName}
                            </p>
                            <p className="text-xs text-slate-500 hidden sm:block">Empowering Lives</p>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.url}
                                href={link.url}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                                    pathname === link.url
                                        ? "text-blue-800 bg-blue-50"
                                        : "text-slate-600 hover:text-blue-800 hover:bg-blue-50"
                                )}
                            >
                                {link.label}
                                {pathname === link.url && (
                                    <motion.span
                                        layoutId="nav-indicator"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600"
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-800">
                                Login
                            </Button>
                        </Link>
                        <Link href="/donate">
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                                <Heart className="w-4 h-4 mr-1 fill-white" />
                                Donate
                            </Button>
                        </Link>
                        <Link href={ctaLink}>
                            <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white">
                                {ctaText}
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white border-t border-slate-100 shadow-xl overflow-hidden"
                    >
                        <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.url}
                                    href={link.url}
                                    className={cn(
                                        "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        pathname === link.url
                                            ? "bg-blue-50 text-blue-800 font-semibold"
                                            : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                                <Link href="/login">
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link href="/donate">
                                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                        <Heart className="w-4 h-4 mr-2 fill-white" />
                                        Donate Now
                                    </Button>
                                </Link>
                                <Link href={ctaLink}>
                                    <Button className="w-full bg-blue-800 hover:bg-blue-900 text-white">
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
