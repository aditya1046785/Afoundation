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
        <div className="min-h-screen bg-white">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="font-serif text-4xl font-bold mb-3">Get in Touch</h1>
                    <p className="text-blue-200">We&apos;d love to hear from you. Reach out with questions, suggestions, or partnership ideas.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <ContactForm />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info Cards */}
                        {[
                            { icon: MapPin, label: "Address", value: settings.contact_address || "Not set", color: "bg-blue-50 text-blue-700" },
                            { icon: Phone, label: "Phone", value: settings.contact_phone || "Not set", color: "bg-emerald-50 text-emerald-700" },
                            { icon: Mail, label: "Email", value: settings.contact_email || "Not set", color: "bg-amber-50 text-amber-700" },
                            { icon: Clock, label: "Working Hours", value: settings.contact_hours || "Mon-Sat 10 AM - 6 PM", color: "bg-purple-50 text-purple-700" },
                        ].map((item) => {
                            const Icon = item.icon;
                            const [bg, textColor] = item.color.split(" ");
                            return (
                                <div key={item.label} className="bg-white rounded-2xl shadow-md p-5 border border-slate-100">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-5 h-5 ${textColor}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                                            <p className="text-slate-500 text-sm mt-1">{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Map */}
                        {settings.contact_map_embed && (
                            <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 aspect-video">
                                <iframe
                                    src={settings.contact_map_embed}
                                    className="w-full h-full border-0"
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
