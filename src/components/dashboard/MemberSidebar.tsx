"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Heart, Award, CreditCard, User, Heart as HeartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { label: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
    { label: "My Donations", href: "/member/donations", icon: Heart },
    { label: "Certificates", href: "/member/certificates", icon: Award },
    { label: "ID Card", href: "/member/id-card", icon: CreditCard },
    { label: "My Profile", href: "/member/profile", icon: User },
];

export function MemberSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-52 bg-slate-900 h-full shrink-0">
            {/* Logo */}
            <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                    <Image src="/favicon.ico" alt="Nirashray Logo" width={36} height={36} className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm">Nirashray</p>
                    <p className="text-slate-400 text-xs">Member Portal</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-2 space-y-0.5">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive ? "bg-blue-700 text-white shadow-sm" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Back to site */}
            <div className="p-3 border-t border-slate-700">
                <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-xs py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors">
                    ← Back to Website
                </Link>
            </div>
        </aside>
    );
}
