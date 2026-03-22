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
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Heart className="w-12 h-12 mx-auto mb-4 fill-amber-400 text-amber-400" />
                    <h1 className="font-serif text-4xl font-bold mb-3">
                        {settings.donate_banner_title || "Support Our Cause"}
                    </h1>
                    <p className="text-blue-200 text-lg">
                        {settings.donate_why_text || "Your generous contribution helps those in need."}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <DonateForm presetAmounts={presetAmounts} purposes={purposes} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trust badges */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-700" />
                                Trust & Security
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    settings.donate_trust_badge1 || "80G Tax Benefits Available",
                                    settings.donate_trust_badge2 || "100% Transparent Utilization",
                                    settings.donate_trust_badge3 || "Secure Payment via Razorpay",
                                ].map((badge) => (
                                    <li key={badge} className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                        {badge}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Bank details for manual transfer */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-700" />
                                Other Ways to Donate
                            </h3>
                            <div className="text-sm text-slate-600 space-y-2">
                                <p>For bank transfers or cheques, please contact us:</p>
                                <p className="font-medium text-slate-800">{settings.contact_email}</p>
                                <p className="font-medium text-slate-800">{settings.contact_phone}</p>
                            </div>
                        </div>

                        {/* Tax benefits info */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2">Tax Benefits</h3>
                            <p className="text-sm text-blue-700">
                                Donations to Nirashray Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961.
                            </p>
                            <p className="text-xs text-blue-500 mt-2">
                                Reg. No: {settings.registration_number || "XXXXX"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
