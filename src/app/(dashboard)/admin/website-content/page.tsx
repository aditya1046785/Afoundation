import { Metadata } from "next";
import Link from "next/link";
import { Home, Info, Phone, Heart, Globe, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Website Content | Admin Dashboard" };

const pages = [
    { title: "Home Page", description: "Hero, stats, causes, testimonials", icon: Home, href: "/admin/website-content/home", color: "bg-blue-50 text-blue-700" },
    { title: "About Page", description: "Story, mission, vision, values", icon: Info, href: "/admin/website-content/about", color: "bg-emerald-50 text-emerald-700" },
    { title: "Contact Page", description: "Address, phone, email, map", icon: Phone, href: "/admin/website-content/contact", color: "bg-amber-50 text-amber-700" },
    { title: "Donate Page", description: "Donation messaging, bank details", icon: Heart, href: "/admin/website-content/donate", color: "bg-rose-50 text-rose-700" },
    { title: "General Settings", description: "Org info, social links, legal", icon: Globe, href: "/admin/website-content/general", color: "bg-purple-50 text-purple-700" },
];

export default function WebsiteContentIndexPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">Website Content</h1>
                <p className="text-slate-500 text-sm mt-1">Edit all website pages without touching any code</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pages.map((page) => {
                    const Icon = page.icon;
                    const [bgColor, textColor] = page.color.split(" ");
                    return (
                        <Link key={page.href} href={page.href}>
                            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-6 h-6 ${textColor}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{page.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{page.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
