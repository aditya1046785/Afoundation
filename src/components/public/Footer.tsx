import Link from "next/link";
import Image from "next/image";
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, MessageCircle } from "lucide-react";
import { safeJsonParse } from "@/lib/utils";

interface FooterProps {
    settings: Record<string, string>;
}

interface NavLink {
    label: string;
    url: string;
}

export function Footer({ settings }: FooterProps) {
    const quickLinks = safeJsonParse<NavLink[]>(settings.footer_quick_links || "[]", []);
    const siteName = settings.site_name || "Nirashray Foundation";
    const footerDesc = settings.footer_description || "";
    const copyright = settings.footer_copyright || `© ${new Date().getFullYear()} Nirashray Foundation. All rights reserved.`;

    const socialLinks = [
        { icon: Facebook, url: settings.facebook_url, label: "Facebook" },
        { icon: Instagram, url: settings.instagram_url, label: "Instagram" },
        { icon: Twitter, url: settings.twitter_url, label: "Twitter" },
        { icon: Linkedin, url: settings.linkedin_url, label: "LinkedIn" },
        { icon: Youtube, url: settings.youtube_url, label: "YouTube" },
    ].filter((s) => s.url);

    return (
        <footer className="bg-[#0b1121] text-slate-400 relative overflow-hidden">
            {/* Deep artistic mesh overlay */}
            <div 
                className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-overlay"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />
            
            <div className="absolute -top-[100px] -right-[100px] w-96 h-96 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-[100px] -left-[100px] w-96 h-96 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Main Footer */}
            <div className="container mx-auto px-6 max-w-7xl py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-4 lg:pr-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-700">
                                <Image src="/favicon.ico" alt={`${siteName} Logo`} width={48} height={48} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-serif font-bold text-white text-2xl tracking-tight">{siteName}</span>
                        </div>
                        <p className="text-base text-slate-400 leading-relaxed mb-6 font-light">{footerDesc}</p>
                        {settings.registration_number && (
                            <div className="inline-block border border-slate-700/50 bg-slate-800/30 px-3 py-1.5 rounded-md mb-8">
                                <p className="text-xs text-amber-400/80 font-medium tracking-wide">REG. NO: {settings.registration_number}</p>
                            </div>
                        )}
                        {/* Social links */}
                        {socialLinks.length > 0 && (
                            <div className="flex gap-3 flex-wrap">
                                {socialLinks.map(({ icon: Icon, url, label }) => (
                                    <a
                                        key={label}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="w-10 h-10 rounded-full border border-slate-700/50 hover:bg-amber-500 hover:border-amber-500 hover:text-slate-900 flex items-center justify-center transition-all duration-300 group"
                                    >
                                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 lg:col-start-6">
                        <h3 className="font-serif font-bold text-white mb-6 text-xl">Quick Links</h3>
                        <ul className="space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link.url}>
                                    <Link
                                        href={link.url}
                                        className="text-slate-400 hover:text-amber-400 text-base transition-colors hover:pl-2 duration-300 inline-block font-light"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Get Involved */}
                    <div className="lg:col-span-2">
                        <h3 className="font-serif font-bold text-white mb-6 text-xl">Get Involved</h3>
                        <ul className="space-y-4">
                            {[
                                { label: "Become a Member", url: "/register" },
                                { label: "Donate Now", url: "/donate" },
                                { label: "Volunteer", url: "/contact" },
                                { label: "Download Resources", url: "/downloads" },
                                { label: "Verify Certificate", url: "/verify" },
                            ].map((link) => (
                                <li key={link.url}>
                                    <Link
                                        href={link.url}
                                        className="text-slate-400 hover:text-amber-400 text-base transition-colors hover:pl-2 duration-300 inline-block font-light"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-3">
                        <h3 className="font-serif font-bold text-white mb-6 text-xl">Contact</h3>
                        <ul className="space-y-5">
                            {settings.contact_email && (
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700/50">
                                        <Mail className="w-4 h-4 text-amber-500/80" />
                                    </div>
                                    <a href={`mailto:${settings.contact_email}`} className="text-slate-400 hover:text-white text-sm transition-colors break-all mt-1.5 font-light">
                                        {settings.contact_email}
                                    </a>
                                </li>
                            )}
                            {settings.contact_phone && (
                                <li className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700/50">
                                        <Phone className="w-4 h-4 text-amber-500/80" />
                                    </div>
                                    <a href={`tel:${settings.contact_phone}`} className="text-slate-400 hover:text-white text-sm transition-colors font-light">
                                        {settings.contact_phone}
                                    </a>
                                </li>
                            )}
                            {settings.whatsapp_number && (
                                <li className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700/50">
                                        <MessageCircle className="w-4 h-4 text-emerald-500/80" />
                                    </div>
                                    <a
                                        href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-white text-sm transition-colors font-light"
                                    >
                                        WhatsApp Connect
                                    </a>
                                </li>
                            )}
                            {(settings.address_line1 || settings.address_line2) && (
                                <li className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700/50 mt-1">
                                        <MapPin className="w-4 h-4 text-amber-500/80" />
                                    </div>
                                    <span className="text-slate-400 text-sm leading-relaxed font-light py-1">
                                        {settings.address_line1}
                                        {settings.address_line2 && <><br />{settings.address_line2}</>}
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800/60 relative z-10 bg-[#070b15]/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500 text-center sm:text-left font-light tracking-wide">{copyright}</p>
                    <div className="flex items-center gap-6 text-sm text-slate-500 font-light">
                        <Link href="/about" className="hover:text-amber-400 transition-colors">History</Link>
                        <Link href="/contact" className="hover:text-amber-400 transition-colors">Support</Link>
                        <Link href="/downloads" className="hover:text-amber-400 transition-colors">Documents</Link>
                    </div>
                </div>
                <div className="container mx-auto px-6 max-w-7xl pb-6">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 font-light">
                        <Link href="/donation-privacy-policy" className="hover:text-amber-400 transition-colors">
                            Donation Privacy Policy
                        </Link>
                        <Link href="/terms-and-conditions" className="hover:text-amber-400 transition-colors">
                            Terms and Conditions
                        </Link>
                        <Link href="/refund-and-cancellation-policy" className="hover:text-amber-400 transition-colors">
                            Refund and Cancellation Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
