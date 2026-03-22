"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Users, Heart, Award, CreditCard, FileText,
    Calendar, Images, Megaphone, Download, MessageSquare, Settings,
    Globe, ChevronDown, ChevronRight, Heart as HeartIcon, X, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLink {
    label: string;
    href: string;
    icon: React.ElementType;
    roles?: string[];
    children?: { label: string; href: string }[];
}

const links: SidebarLink[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Members", href: "/admin/members", icon: Users },
    { label: "Donations", href: "/admin/donations", icon: Heart },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "ID Cards", href: "/admin/id-cards", icon: CreditCard },
    { label: "Events", href: "/admin/events", icon: Calendar },
    { label: "Blog", href: "/admin/blog", icon: FileText },
    { label: "Gallery", href: "/admin/gallery", icon: Images },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
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

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={cn("p-4 border-b border-slate-700 flex items-center gap-3", collapsed && "justify-center")}>
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                    <Image src="/favicon.ico" alt="Nirashray Logo" width={36} height={36} className="w-full h-full object-cover" />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">Nirashray</p>
                        <p className="text-slate-400 text-xs">Admin Panel</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
                {filteredLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    const isExpanded = expandedItems.includes(link.label);

                    if (link.children) {
                        return (
                            <div key={link.label}>
                                <button
                                    onClick={() => toggleExpand(link.label)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive ? "bg-blue-700 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                    )}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 text-left">{link.label}</span>
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {isExpanded && !collapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-7 mt-0.5 space-y-0.5 overflow-hidden"
                                        >
                                            {link.children.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={cn(
                                                        "block px-3 py-1.5 rounded-lg text-xs transition-colors",
                                                        pathname === child.href
                                                            ? "bg-blue-600/30 text-blue-300 font-medium"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-700"
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
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                collapsed && "justify-center",
                                isActive
                                    ? "bg-blue-700 text-white shadow-md"
                                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                            )}
                            title={collapsed ? link.label : undefined}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle (desktop) */}
            <div className="p-3 border-t border-slate-700">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-xs py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <Menu className="w-4 h-4" />
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 64 : 240 }}
                transition={{ duration: 0.2 }}
                className="hidden md:flex flex-col bg-slate-900 h-full shrink-0 overflow-hidden"
            >
                <SidebarContent />
            </motion.aside>
        </>
    );
}
