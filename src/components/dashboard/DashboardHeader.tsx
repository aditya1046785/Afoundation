"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, ChevronDown, User, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import Link from "next/link";

interface DashboardHeaderProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: string;
    };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    return (
        <header className="h-[72px] bg-white/70 backdrop-blur-md border-b border-brand-accent-200/40 flex items-center justify-between pl-14 pr-4 md:px-6 shrink-0 relative z-20">
            {/* Breadcrumb / App name */}
            <div className="flex items-center gap-2">
                <h2 className="font-serif italic text-brand-accent-700 tracking-wide text-[15px]">Nirashray Workspace</h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative group hover:bg-brand-accent-50 rounded-xl transition-all w-10 h-10">
                    <Bell className="w-5 h-5 text-brand-neutral-500 group-hover:text-brand-accent-600 transition-colors" strokeWidth={1.5} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-accent-500 shadow-sm shadow-brand-accent-500/50" />
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 hover:bg-white/50 border border-transparent hover:border-brand-accent-100 px-2 py-1.5 rounded-[1.25rem] transition-all focus:outline-none focus:ring-2 focus:ring-brand-accent-200/50">
                            <Avatar className="w-9 h-9 border border-brand-accent-100 shadow-sm">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-brand-accent-50 text-brand-accent-700 text-xs font-bold font-serif">
                                    {getInitials(user.name || user.email || "U")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-left hidden sm:block mr-1">
                                <p className="text-[13px] font-bold text-brand-neutral-800 leading-none mb-0.5 tracking-tight">{user.name}</p>
                                <p className="text-[10px] text-brand-accent-600 tracking-widest uppercase font-semibold">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-brand-neutral-400 mr-1" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl border-brand-accent-100 shadow-xl overflow-hidden p-1 bg-white/95 backdrop-blur-md">
                        <DropdownMenuLabel className="px-3 py-2.5">
                            <p className="text-xs text-brand-neutral-500 font-normal truncate">{user.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-brand-accent-100/50 mx-2" />
                        <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-brand-accent-50 hover:text-brand-accent-800 focus:bg-brand-accent-50 focus:text-brand-accent-800 transition-colors mx-1 my-0.5 px-3 py-2.5">
                            <Link href="/member/dashboard">
                                <User className="w-4 h-4 mr-2.5 opacity-70" strokeWidth={2} />
                                <span className="font-medium text-sm">Member View</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-brand-accent-50 hover:text-brand-accent-800 focus:bg-brand-accent-50 focus:text-brand-accent-800 transition-colors mx-1 my-0.5 px-3 py-2.5">
                            <Link href="/">
                                <Globe className="w-4 h-4 mr-2.5 opacity-70" strokeWidth={2} />
                                <span className="font-medium text-sm">View Website</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-brand-accent-100/50 mx-2" />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-red-500 cursor-pointer rounded-xl hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 transition-colors mx-1 my-0.5 px-3 py-2.5 font-medium"
                        >
                            <LogOut className="w-4 h-4 mr-2.5" strokeWidth={2} />
                            <span className="text-sm">Sign Out securely</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
