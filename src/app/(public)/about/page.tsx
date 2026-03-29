export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { getAllSiteSettings } from "@/lib/site-settings";
import Image from "next/image";
import { CheckCircle2, Heart, Target, Eye, Users, Award, Shield, Star } from "lucide-react";

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn about Nirashray Foundation — our mission, vision, values, and the team behind our work.",
};

export default async function AboutPage() {
    const settings = await getAllSiteSettings();

    return (
        <div className="min-h-screen bg-[#fdfcfa] relative overflow-hidden font-light pt-24">
            {/* Subtle global paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply fixed"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />

            {/* Banner Section */}
            <div className="relative py-32 text-center border-b border-amber-200/40">
                {/* Watercolor Banner Splash */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-100/50 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none" />
                
                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <p className="font-serif italic text-amber-600 text-2xl tracking-wide mb-6">
                        Our Genesis
                    </p>
                    <h1 className="font-serif text-6xl md:text-7xl font-bold mb-8 text-slate-800 tracking-tight leading-[1.1] relative inline-block">
                        {settings.about_page_heading || "About Nirashray Foundation"}
                        <svg className="absolute -bottom-2 -left-2 w-[110%] h-4 text-amber-300 stroke-current opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h1>
                    <p className="text-slate-500 text-2xl font-light max-w-2xl mx-auto leading-relaxed mt-6">
                        {settings.about_page_subheading || "Empowering communities through education, healthcare, and sustainable development"}
                    </p>
                </div>
            </div>

            {/* Story Section */}
            <section className="py-32 relative">
                {/* Blue ambient splash */}
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-50/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-6 flex justify-center">
                            {/* SVG Masked Image */}
                            <div 
                                className="relative w-full aspect-square max-w-lg"
                                style={{
                                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M39.6,-66.6C52.4,-57.4,64.8,-47.9,73.1,-35.1C81.4,-22.4,85.6,-6.4,84.1,9.4C82.7,25.3,75.6,41,64.2,52C52.9,63.1,37.3,69.5,21.9,73.8C6.6,78.2,-8.6,80.6,-22.8,77C-37,73.4,-50.2,63.8,-61.6,51.8C-73,39.9,-82.6,25.6,-86.3,10C-90.1,-5.5,-88,-22.3,-79.6,-36.1C-71.1,-49.9,-56.3,-60.7,-41.8,-69.1C-27.4,-77.6,-13.7,-83.8,-0.2,-83.4C13.2,-83.1,26.8,-75.9,39.6,-66.6Z' transform='translate(100 100)' /%3E%3C/svg%3E")`,
                                    WebkitMaskSize: "contain",
                                    WebkitMaskRepeat: "no-repeat",
                                    WebkitMaskPosition: "center",
                                    maskImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M39.6,-66.6C52.4,-57.4,64.8,-47.9,73.1,-35.1C81.4,-22.4,85.6,-6.4,84.1,9.4C82.7,25.3,75.6,41,64.2,52C52.9,63.1,37.3,69.5,21.9,73.8C6.6,78.2,-8.6,80.6,-22.8,77C-37,73.4,-50.2,63.8,-61.6,51.8C-73,39.9,-82.6,25.6,-86.3,10C-90.1,-5.5,-88,-22.3,-79.6,-36.1C-71.1,-49.9,-56.3,-60.7,-41.8,-69.1C-27.4,-77.6,-13.7,-83.8,-0.2,-83.4C13.2,-83.1,26.8,-75.9,39.6,-66.6Z' transform='translate(100 100)' /%3E%3C/svg%3E")`,
                                    maskSize: "contain",
                                    maskRepeat: "no-repeat",
                                    maskPosition: "center"
                                }}
                            >
                                <div className="absolute inset-0 hover:scale-105 transition-transform duration-1000">
                                    <Image
                                        src={settings.about_story_image || "/hero-bg.jpg"}
                                        alt="Our Story"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-6">
                            <h2 className="font-serif text-5xl font-bold text-slate-800 mb-8 tracking-tight">
                                {settings.about_story_heading || "How It All Began"}
                            </h2>
                            <div className="text-slate-600 leading-relaxed space-y-6 text-xl font-light">
                                <p>
                                {settings.about_story_text || "Nirashray Foundation was established with a vision to create lasting positive change in the lives of underprivileged communities across India. What started as a small initiative has grown into a movement that touches thousands of lives each year."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Values */}
            <section className="py-32 bg-[#fffcf5] border-y border-amber-100/30 relative">
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                        {[
                            {
                                icon: Target, title: "Our Mission",
                                text: settings.about_mission || "To empower underprivileged communities through education, healthcare, and sustainable development programs.",
                            },
                            {
                                icon: Eye, title: "Our Vision",
                                text: settings.about_vision || "A world where every individual has access to opportunities for growth and development.",
                            },
                            {
                                icon: Heart, title: "Our Values",
                                text: settings.about_values || "Compassion, transparency, integrity, empowerment, and community-driven change.",
                            },
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="relative group p-10 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-white/80">
                                    <div className="absolute -top-10 -right-4 font-serif text-[120px] font-bold text-slate-900/[0.03] select-none group-hover:-translate-y-2 transition-transform duration-500">
                                        0{idx + 1}
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                                        <Icon className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="font-serif text-3xl font-bold text-slate-800 mb-4 relative z-10">{item.title}</h3>
                                    <p className="text-slate-500 text-lg leading-relaxed relative z-10">{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-32 relative">
                <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
                    <p className="font-serif italic text-amber-600 text-xl tracking-wide mb-4">Why Us</p>
                    <h2 className="font-serif text-4xl lg:text-5xl font-bold text-slate-800 mb-16 relative inline-block">
                        Why Choose Nirashray Foundation
                        <svg className="absolute -bottom-1 -left-1 w-[110%] h-3 text-amber-300 stroke-current opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 text-left">
                        {[
                            { icon: Shield, text: "Registered NGO under Societies Registration Act" },
                            { icon: Award, text: "80G Tax Exemption Certificate for donations" },
                            { icon: Users, text: "Community-driven approach with local participation" },
                            { icon: Star, text: "100% transparent fund utilization and reporting" },
                            { icon: Heart, text: "Dedicated team of passionate volunteers" },
                            { icon: CheckCircle2, text: "Measurable impact through data-driven programs" },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.text} className="flex items-start gap-5 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)] transition-all duration-300">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                        <Icon className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <span className="text-slate-700 text-lg leading-tight mt-1.5">{item.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Legal / Registration */}
            <section className="py-24 bg-[#0b1121] text-center border-t border-slate-800">
                {/* Deep background mesh */}
                <div 
                    className="absolute inset-0 opacity-[0.3] pointer-events-none mix-blend-overlay"
                    style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                    }}
                />
                <div className="container mx-auto px-6 max-w-3xl relative z-10">
                    <h2 className="font-serif text-3xl font-bold text-white mb-10 tracking-wide">Legal Information</h2>
                    <div className="rounded-[2rem] p-10 bg-slate-900/50 backdrop-blur-sm border border-slate-800">
                        <div className="space-y-6 text-lg text-slate-400 font-light">
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:border-b border-slate-800 pb-4">
                                <span className="text-slate-500 uppercase tracking-widest text-sm font-medium">Registration No</span>
                                <span className="text-amber-400 font-serif text-xl">{settings.registration_number || "XXX/XXX/XXXX"}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:border-b border-slate-800 pb-4">
                                <span className="text-slate-500 uppercase tracking-widest text-sm font-medium">80G Certificate</span>
                                <span className="text-white">Available for all donations</span>
                            </div>
                            <p className="pt-4 italic">
                                {settings.footer_legal_text || "Nirashray Foundation is registered under the Societies Registration Act. We ensure 100% transparent audits and fund utilization."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
