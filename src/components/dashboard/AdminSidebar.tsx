"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Users, Heart, Award, CreditCard, FileText,
    Calendar, Images, Megaphone, Download, MessageSquare, Settings,
    Globe, ChevronDown, ChevronRight, Heart as HeartIcon, Menu, Target, MessageSquareDot, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarLink {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    roles?: string[];
    children?: { label: string; href: string }[];
}

const links: SidebarLink[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Members", href: "/admin/members", icon: Users },
    { label: "Donations", href: "/admin/donations", icon: Heart },
    { label: "Receipts", href: "/admin/receipts", icon: FileText },
    { label: "Referrals", href: "/admin/referrals", icon: Link2 },
    { label: "Crowdfunding", href: "/admin/crowdfunding", icon: Target },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "ID Cards", href: "/admin/id-cards", icon: CreditCard },
    { label: "Events", href: "/admin/events", icon: Calendar },
    { label: "Blog", href: "/admin/blog", icon: FileText },
    { label: "Gallery", href: "/admin/gallery", icon: Images },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Live Chat", href: "/admin/live-chat", icon: MessageSquareDot },
    { label: "Downloads", href: "/admin/downloads", icon: Download },
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    { label: "Team", href: "/admin/team", icon: Users },
    {
        label: "Website CMS",
        href: "/admin/website-content",
        icon: Globe,
        children: [
            { label: "Home Page", href: "/admin/website-content/home" },
            { label: "About Page", href: "/admin/website-content/about" },
            { label: "Donate Page", href: "/admin/website-content/donate" },
            { label: "Contact Page", href: "/admin/website-content/contact" },
            { label: "Navbar & Footer", href: "/admin/website-content/nav-footer" },
            { label: "General Settings", href: "/admin/website-content/general" },
        ],
    },
    { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
];

interface Props {
    role: string;
}

export function AdminSidebar({ role }: Props) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );
    };

    const filteredLinks = links.filter((l) => !l.roles || l.roles.includes(role));

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#0b1121]">
            {/* Logo */}
            <div className={cn("p-6 border-b border-slate-800/60 flex items-center gap-4", collapsed && "justify-center px-4")}>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <HeartIcon className="w-5 h-5 text-amber-500 fill-amber-500/20" strokeWidth={1.5} />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-white font-serif font-bold text-lg leading-tight tracking-wide truncate">Nirashray</p>
                        <p className="text-amber-500/80 text-[10px] uppercase tracking-widest font-semibold mt-0.5">Workspace</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                {filteredLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    const isExpanded = expandedItems.includes(link.label);

                    if (link.children) {
                        return (
                            <div key={link.label} className="mb-1">
                                <button
                                    onClick={() => toggleExpand(link.label)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                        isActive ? "bg-amber-500/10 text-amber-400" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                                    )}
                                >
                                    <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 text-left">{link.label}</span>
                                            {isExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                                        </>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {isExpanded && !collapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-5 mt-1 pl-4 border-l border-slate-800/60 space-y-1 overflow-hidden"
                                        >
                                            {link.children.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={cn(
                                                        "block px-3 py-2 rounded-lg text-[13px] transition-all duration-200",
                                                        pathname === child.href
                                                            ? "bg-amber-500/10 text-amber-400 font-semibold"
                                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                                    )}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1",
                                collapsed && "justify-center",
                                isActive
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent"
                            )}
                            title={collapsed ? link.label : undefined}
                        >
                            <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-amber-500")} strokeWidth={2} />
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle (desktop) */}
            <div className="p-4 border-t border-slate-800/60 bg-[#0b1121]">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-3 text-slate-400 hover:text-white text-xs py-2.5 px-3 rounded-xl hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700/50"
                >
                    <Menu className="w-4 h-4" />
                    {!collapsed && <span className="font-medium tracking-wide uppercase text-[10px]">Collapse</span>}
                </button>
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
            <motion.aside
                animate={{ width: collapsed ? 80 : 260 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex flex-col bg-[#0b1121] h-full shrink-0 overflow-hidden border-r border-slate-800/60 relative z-30"
            >
                {sidebarContent}
            </motion.aside>
        </>
    );
}
