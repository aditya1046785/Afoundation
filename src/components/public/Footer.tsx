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
        <footer className="bg-slate-900 text-slate-300">
            {/* Main Footer */}
            <div className="container mx-auto px-4 max-w-7xl py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                <Image src="/favicon.ico" alt="Nirashray Foundation Logo" width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-serif font-bold text-white text-lg">{siteName}</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">{footerDesc}</p>
                        {settings.registration_number && (
                            <p className="text-xs text-slate-500 mb-4">Reg. No: {settings.registration_number}</p>
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
                                        className="w-8 h-8 rounded-full bg-slate-700 hover:bg-blue-700 flex items-center justify-center transition-colors"
                                    >
                                        <Icon className="w-4 h-4 text-white" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.url}>
                                    <Link
                                        href={link.url}
                                        className="text-slate-400 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block"
                                    >
                                        → {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Get Involved */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Get Involved</h3>
                        <ul className="space-y-2">
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
                                        className="text-slate-400 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block"
                                    >
                                        → {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h3>
                        <ul className="space-y-3">
                            {settings.contact_email && (
                                <li className="flex items-start gap-2">
                                    <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                    <a href={`mailto:${settings.contact_email}`} className="text-slate-400 hover:text-white text-sm transition-colors break-all">
                                        {settings.contact_email}
                                    </a>
                                </li>
                            )}
                            {settings.contact_phone && (
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                                    <a href={`tel:${settings.contact_phone}`} className="text-slate-400 hover:text-white text-sm transition-colors">
                                        {settings.contact_phone}
                                    </a>
                                </li>
                            )}
                            {settings.whatsapp_number && (
                                <li className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <a
                                        href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        WhatsApp
                                    </a>
                                </li>
                            )}
                            {(settings.address_line1 || settings.address_line2) && (
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-slate-400 text-sm leading-relaxed">
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
            <div className="border-t border-slate-700">
                <div className="container mx-auto px-4 max-w-7xl py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 text-center sm:text-left">{copyright}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <Link href="/about" className="hover:text-white transition-colors">About</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                        <Link href="/downloads" className="hover:text-white transition-colors">Downloads</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
