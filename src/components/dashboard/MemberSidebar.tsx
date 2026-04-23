"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Heart, Award, CreditCard, User, Heart as HeartIcon, Menu, MessageSquareDot, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
    { label: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
    { label: "My Donations", href: "/member/donations", icon: Heart },
    { label: "Referred Donations", href: "/member/referrals", icon: Link2 },
    { label: "Certificates", href: "/member/certificates", icon: Award },
    { label: "ID Card", href: "/member/id-card", icon: CreditCard },
    { label: "Live Chat", href: "/member/live-chat", icon: MessageSquareDot },
    { label: "My Profile", href: "/member/profile", icon: User },
];

export function MemberSidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#0b1121]">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800/60 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <HeartIcon className="w-5 h-5 text-amber-500 fill-amber-500/20" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-white font-serif font-bold text-lg leading-tight tracking-wide">Nirashray</p>
                    <p className="text-amber-500/80 text-[10px] uppercase tracking-widest font-semibold mt-0.5">Member Portal</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-6 px-3 space-y-1 custom-scrollbar overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1",
                                isActive
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent"
                            )}
                        >
                            <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-amber-500")} strokeWidth={2} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Back to site */}
            <div className="p-4 border-t border-slate-800/60 bg-[#0b1121]">
                <Link href="/" className="flex items-center justify-center gap-3 text-slate-400 hover:text-white text-xs py-2.5 px-3 rounded-xl hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700/50">
                    ← <span className="font-medium tracking-wide uppercase text-[10px]">Back to Website</span>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                        <button className="absolute top-[18px] left-4 z-50 p-2 bg-amber-500/10 text-amber-600 rounded-xl hover:bg-amber-500/20 transition-colors border border-amber-500/20">
                            <Menu className="w-5 h-5" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r border-slate-800/60 bg-[#0b1121] w-[280px]">
                        {sidebarContent}
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-[260px] bg-[#0b1121] h-full shrink-0 border-r border-slate-800/60 relative z-30">
                {sidebarContent}
            </aside>
        </>
    );
}
