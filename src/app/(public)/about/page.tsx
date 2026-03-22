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
        <div className="min-h-screen bg-white">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-20 text-white text-center">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="font-serif text-5xl font-bold mb-4">
                        {settings.about_page_heading || "About Nirashray Foundation"}
                    </h1>
                    <p className="text-blue-200 text-lg">
                        {settings.about_page_subheading || "Empowering communities through education, healthcare, and sustainable development"}
                    </p>
                </div>
            </div>

            {/* Story Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                            <Image
                                src={settings.about_story_image || "/hero-bg.jpg"}
                                alt="Our Story"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div>
                            <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Our Story</p>
                            <h2 className="font-serif text-3xl font-bold text-slate-900 mb-6">
                                {settings.about_story_heading || "How It All Began"}
                            </h2>
                            <div className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-line">
                                {settings.about_story_text || "Nirashray Foundation was established with a vision to create lasting positive change in the lives of underprivileged communities across India. What started as a small initiative has grown into a movement that touches thousands of lives each year."}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Values */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target, title: "Our Mission", color: "text-blue-700 bg-blue-50 border-blue-200",
                                text: settings.about_mission || "To empower underprivileged communities through education, healthcare, and sustainable development programs.",
                            },
                            {
                                icon: Eye, title: "Our Vision", color: "text-emerald-700 bg-emerald-50 border-emerald-200",
                                text: settings.about_vision || "A world where every individual has access to opportunities for growth and development.",
                            },
                            {
                                icon: Heart, title: "Our Values", color: "text-rose-600 bg-rose-50 border-rose-200",
                                text: settings.about_values || "Compassion, transparency, integrity, empowerment, and community-driven change.",
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            const [textColor, bgColor, borderColor] = item.color.split(" ");
                            return (
                                <div key={item.title} className={`rounded-2xl border-2 ${borderColor} p-8 bg-white`}>
                                    <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center mb-5`}>
                                        <Icon className={`w-7 h-7 ${textColor}`} />
                                    </div>
                                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Why Us</p>
                    <h2 className="font-serif text-3xl font-bold text-slate-900 mb-10">Why Choose Nirashray Foundation</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
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
                                <div key={item.text} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                                    <Icon className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                    <span className="text-slate-700 text-sm">{item.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Legal / Registration */}
            <section className="py-16 bg-blue-50">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-4">Legal Information</h2>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 text-sm text-slate-600 space-y-2">
                        <p><strong>Registration No:</strong> {settings.registration_number || "XXX/XXX/XXXX"}</p>
                        <p><strong>80G Certificate:</strong> Available for all donations</p>
                        <p>{settings.footer_legal_text || "Nirashray Foundation is registered under the Societies Registration Act."}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
