"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, ChevronDown, User } from "lucide-react";
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            {/* Breadcrumb / App name */}
            <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-800 text-sm">Admin Dashboard</h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-bold">
                                    {getInitials(user.name || user.email || "U")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-slate-800 leading-none">{user.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/member/dashboard" className="cursor-pointer">
                                <User className="w-4 h-4 mr-2" /> Member View
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/" className="cursor-pointer">
                                <User className="w-4 h-4 mr-2" /> View Website
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-red-600 cursor-pointer focus:text-red-700"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
