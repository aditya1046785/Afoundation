export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { getAllSiteSettings } from "@/lib/site-settings";
import { DonateForm } from "@/components/public/DonateForm";
import { Shield, FileText, Heart, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Donate",
    description: "Support Nirashray Foundation and make a difference. Donate online securely via Razorpay. 80G tax benefits available.",
};

export default async function DonatePage() {
    const settings = await getAllSiteSettings();
    const presetAmounts = (settings.donate_amounts || "500,1000,2000,5000,10000").split(",").map(Number);
    const purposes = (settings.donate_purposes || "General Fund").split(",");

    return (
        <div className="min-h-screen bg-[#fdfcfa] relative overflow-hidden font-light pt-20">
            {/* Subtle paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply fixed"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Banner */}
            <div className="relative pt-24 pb-16 text-center border-b border-amber-200/40">
                {/* Glowing artistic background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-100/40 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none" />
                
                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <div className="w-20 h-20 rounded-full bg-amber-50 mx-auto flex items-center justify-center mb-6 shadow-sm border border-amber-100">
                        <Heart className="w-8 h-8 text-amber-500 fill-amber-50" strokeWidth={1.5} />
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-slate-800 tracking-tight relative inline-block">
                        {settings.donate_banner_title || "Support Our Cause"}
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h1>
                    <p className="text-slate-500 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mt-4">
                        {settings.donate_why_text || "Your generous contribution helps those in need. Every drop creates a ripple of hope."}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl py-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Form Component */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <DonateForm presetAmounts={presetAmounts} purposes={purposes} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                        {/* Trust badges */}
                        <div className="bg-white/60 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 border border-white/50 relative overflow-hidden group hover:bg-white/80 transition-all duration-500">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl group-hover:bg-amber-100 transition-colors duration-500" />
                            <h3 className="font-serif text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 relative z-10">
                                <Shield className="w-6 h-6 text-amber-500" />
                                Trust & Security
                            </h3>
                            <ul className="space-y-4 relative z-10">
                                {[
                                    settings.donate_trust_badge1 || "80G Tax Benefits Available",
                                    settings.donate_trust_badge2 || "100% Transparent Utilization",
                                    settings.donate_trust_badge3 || "Secure Payment via Razorpay",
                                ].map((badge) => (
                                    <li key={badge} className="flex items-start gap-4 text-slate-600 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle className="w-3.5 h-3.5 text-amber-600 font-bold" />
                                        </div>
                                        {badge}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Bank details for manual transfer */}
                        <div className="bg-white/60 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 border border-white/50 relative overflow-hidden group hover:bg-white/80 transition-all duration-500">
                            <h3 className="font-serif text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3 relative z-10">
                                <FileText className="w-6 h-6 text-amber-500" />
                                Offline Donation
                            </h3>
                            <div className="text-slate-600 space-y-3 font-light leading-relaxed relative z-10">
                                <p>For direct bank transfers or cheques, please reach out to our team:</p>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mt-2">
                                    <p className="font-medium text-slate-800">{settings.contact_email}</p>
                                    <p className="font-medium text-slate-800 mt-1">{settings.contact_phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tax benefits info */}
                        <div className="bg-amber-50/50 rounded-[2rem] p-8 border border-amber-200/50 backdrop-blur-sm group hover:bg-amber-50 transition-colors duration-500">
                            <h3 className="font-serif text-xl font-bold text-amber-900 mb-3 tracking-wide">80G Tax Benefits</h3>
                            <p className="text-amber-800/80 leading-relaxed font-light">
                                Donations to Nirashray Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961.
                            </p>
                            <div className="mt-4 pt-4 border-t border-amber-200/50 flex align-center justify-between">
                                <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold">Reg. No</span>
                                <span className="text-sm font-medium text-amber-900">{settings.registration_number || "XXXXX"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
