"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralLinkCardProps {
    referralCode: string;
    referralLink: string;
    title?: string;
    subtitle?: string;
    note?: string;
    badgeLabel?: string;
}

export function ReferralLinkCard({
    referralCode,
    referralLink,
    title = "Share and Raise Donations",
    subtitle = "Referral Link",
    note = "Anyone using this link will be tracked under your referral.",
    badgeLabel = "Code",
}: ReferralLinkCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/20 p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-slate-400">{subtitle}</p>
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">{title}</h2>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    <Share2 className="w-3.5 h-3.5" />
                    {badgeLabel}: {referralCode}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3">
                <p className="text-sm font-medium text-slate-700 break-all flex-1">{referralLink}</p>
                <Button type="button" onClick={handleCopy} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied" : "Copy Link"}
                </Button>
            </div>

            <p className="text-xs text-slate-500 mt-3">{note}</p>
        </div>
    );
}
