export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { getAllSiteSettings } from "@/lib/site-settings";
import { ContactForm } from "@/components/public/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with Nirashray Foundation. We'd love to hear from you.",
};

export default async function ContactPage() {
    const settings = await getAllSiteSettings();

    return (
        <div className="min-h-screen bg-[#fbfaf8] relative overflow-hidden font-light pt-20">
            {/* Subtle paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply fixed"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Banner Section */}
            <div className="relative pt-24 pb-16 text-center border-b border-amber-200/40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-100/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />
                
                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">
                        Connect
                    </p>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-slate-800 tracking-tight relative inline-block">
                        Get in Touch
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h1>
                    <p className="text-slate-500 text-xl font-light max-w-2xl mx-auto leading-relaxed mt-4">
                        We would love to hear from you. Reach out with questions, suggestions, or partnership ideas.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl py-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Contact Form Container Area */}
                    <div className="lg:col-span-7 xl:col-span-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-amber-50/50 rounded-full blur-[80px] pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="font-serif text-3xl font-bold text-slate-800 mb-8 tracking-tight">Send a Message</h2>
                            <ContactForm />
                        </div>
                    </div>

                    {/* Sidebar Information */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        {/* Contact Info Cards */}
                        {[
                            { icon: MapPin, label: "Address", value: settings.contact_address || "Not set", theme: "amber" },
                            { icon: Phone, label: "Phone", value: settings.contact_phone || "Not set", theme: "slate" },
                            { icon: Mail, label: "Email", value: settings.contact_email || "Not set", theme: "amber" },
                            { icon: Clock, label: "Working Hours", value: settings.contact_hours || "Mon-Sat 10 AM - 6 PM", theme: "slate" },
                        ].map((item) => {
                            const Icon = item.icon;
                            // Alternate coloring
                            const isAmber = item.theme === "amber";
                            const iconBg = isAmber ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-200";
                            const iconColor = isAmber ? "text-amber-500" : "text-slate-600";
                            
                            return (
                                <div key={item.label} className="group bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300">
                                    <div className="flex items-start gap-5">
                                        <div className={`w-14 h-14 rounded-2xl ${iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                            <Icon className={`w-6 h-6 ${iconColor}`} />
                                        </div>
                                        <div className="pt-1">
                                            <p className="font-serif font-bold text-slate-800 text-lg">{item.label}</p>
                                            <p className="text-slate-500 font-light text-base mt-1.5 leading-relaxed">{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Map */}
                        {settings.contact_map_embed && (
                            <div className="rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white aspect-[4/3] relative mt-10 p-2 bg-white">
                                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10" />
                                <iframe
                                    src={settings.contact_map_embed}
                                    className="w-full h-full border-0 rounded-2xl grayscale-[20%] contrast-[0.9] hover:grayscale-0 hover:contrast-100 transition-all duration-700"
                                    allowFullScreen
                                    loading="lazy"
                                    title="Office Location"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
