"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Download, Loader2, QrCode, User } from "lucide-react";
import Image from "next/image";
import { getInitials, formatDate } from "@/lib/utils";

interface MemberProfile {
    id: string;
    memberId: string;
    membershipType: string;
    isApproved: boolean;   // ← actual DB field (boolean), there is no "status" string
    joinDate: string;
    user: {
        name: string;
        email: string;
        image: string | null;
    };
    idCards: {
        id: string;
        cardNumber: string;
        expiryDate: string;
        qrCodeData: string | null;
    }[];
}

export default function MemberIDCardPage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<MemberProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            const res = await fetch("/api/members/me");
            const data = await res.json();
            if (data.success) setProfile(data.data);
            setLoading(false);
        }
        fetchProfile();
    }, []);

    const generateIDCard = async () => {
        setGenerating(true);
        try {
            const res = await fetch("/api/id-cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.success) {
                toast.success("ID Card generated!");
                // Reload profile
                const res2 = await fetch("/api/members/me");
                const data2 = await res2.json();
                if (data2.success) setProfile(data2.data);
            } else {
                toast.error(data.error || "Failed to generate ID card.");
            }
        } catch {
            toast.error("An error occurred.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="h-8 bg-slate-100 rounded w-40 animate-pulse" />
                <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No member profile linked to your account.</p>
                <p className="text-slate-400 text-sm">
                    {session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"
                        ? "As an admin, you don't have a member profile. Go to the Members section to manage ID cards."
                        : "Please contact admin to set up your membership profile."}
                </p>
            </div>
        );
    }

    const idCard = profile.idCards?.[0] || null;

    return (
        <div className="space-y-8 max-w-4xl mx-auto relative z-10 pb-10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-sm">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">My ID Card</h1>
                    <p className="text-slate-500 font-medium text-sm mt-2 flex items-center gap-2">
                        Your digital membership identity
                    </p>
                </div>
                {idCard && (
                    <Button variant="outline" className="bg-white/80 border-slate-200 shadow-sm font-semibold tracking-wide text-amber-700 hover:text-amber-800 hover:bg-amber-50">
                        <Download className="w-4 h-4 mr-2" /> Download ID
                    </Button>
                )}
            </div>

            {idCard ? (
                <div className="flex flex-col lg:flex-row gap-8 items-start justify-center pt-4">
                    {/* The ID Card Container */}
                    <div className="flex justify-center flex-1 w-full lg:w-auto relative group">
                        <div className="w-[340px] h-[540px] bg-[#fdfcfa] rounded-[2rem] p-1 shadow-2xl shadow-amber-900/15 border border-amber-900/10 relative overflow-hidden transform-gpu transition-all duration-700 hover:scale-[1.02] hover:-rotate-1 hover:shadow-amber-900/20">
                            {/* Inner stroke */}
                            <div className="absolute inset-2 rounded-3xl border border-amber-900/10 pointer-events-none z-20" />
                            
                            {/* Background Textures */}
                            <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[300px] h-[300px] bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[300px] h-[300px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
                            
                            {/* Content */}
                            <div className="relative h-full flex flex-col bg-white/40 backdrop-blur-sm rounded-[1.75rem] overflow-hidden">
                                {/* Header */}
                                <div className="px-6 pt-10 pb-6 text-center relative z-10">
                                    <p className="font-serif text-amber-800 font-bold text-xl tracking-tight leading-tight">Nirashray</p>
                                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">Foundation</p>
                                    
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 shadow-sm text-[9px] uppercase tracking-widest font-bold px-3">
                                            {profile.membershipType}
                                        </Badge>
                                    </div>
                                </div>
                                
                                {/* Photo & Name */}
                                <div className="px-6 flex flex-col items-center relative z-10 -mt-2">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl shadow-amber-900/10 overflow-hidden bg-amber-50 relative group-hover:scale-[1.03] transition-transform duration-500">
                                            {profile.user.image ? (
                                                <Image src={profile.user.image} alt={profile.user.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50">
                                                    <span className="text-3xl font-serif font-bold text-amber-700/50">{getInitials(profile.user.name)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-slate-800 mt-6 text-center leading-tight tracking-tight px-4">{profile.user.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wide">{profile.user.email}</p>
                                </div>
                                
                                {/* Details */}
                                <div className="px-5 py-5 bg-white/70 mx-5 rounded-2xl border border-white shadow-sm mt-8 relative z-10">
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                                        <div>
                                            <p className="text-[8px] uppercase tracking-widest text-amber-800/60 font-bold mb-1">Member ID</p>
                                            <p className="text-[13px] font-bold text-slate-800 font-mono tracking-tight">{profile.memberId}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] uppercase tracking-widest text-amber-800/60 font-bold mb-1">Card No</p>
                                            <p className="text-[13px] font-bold text-slate-800 font-mono tracking-tight">{idCard.cardNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] uppercase tracking-widest text-amber-800/60 font-bold mb-1">Joined</p>
                                            <p className="text-[13px] font-semibold text-slate-800">{formatDate(new Date(profile.joinDate))}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] uppercase tracking-widest text-amber-800/60 font-bold mb-1">Valid Until</p>
                                            <p className="text-[13px] font-semibold text-slate-800">{formatDate(new Date(idCard.expiryDate))}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* QR & Footer */}
                                <div className="mt-auto pt-6 pb-6 px-8 flex items-end justify-between relative z-10 border-t border-amber-900/5 bg-gradient-to-b from-transparent to-amber-50/50">
                                    <div className="space-y-1.5 mb-1">
                                        <p className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Member Identity</p>
                                        <p className="text-[9px] uppercase tracking-widest text-amber-700/80 font-bold">Valid & Verified</p>
                                    </div>
                                    {idCard.qrCodeData && (
                                        <div className="w-16 h-16 bg-white rounded-xl p-1.5 shrink-0 shadow-md shadow-amber-900/5 border border-white group-hover:shadow-lg transition-shadow duration-500">
                                            <Image src={idCard.qrCodeData} alt="QR Code" width={52} height={52} className="w-full h-full mix-blend-multiply" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions side panel */}
                    <div className="w-full lg:w-[320px] shrink-0">
                        <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/20 overflow-hidden sticky top-32">
                            <CardHeader className="pb-4 border-b border-slate-100/50 bg-white/40">
                                <CardTitle className="text-[15px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-3">
                                    <QrCode className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                                    About ID Card
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ul className="text-sm font-medium text-slate-600 space-y-4">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                                        <p>Your digital ID card serves as proof of membership with Nirashray Foundation.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                                        <p>The QR code on your card can be scanned to verify your membership status instantly.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                                        <p>You can screenshot, download, or print this vertical card for offline use during events.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                                        <p>If any details on your card are incorrect, please contact your workspace administrator.</p>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/20 overflow-hidden">
                    <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                            <CreditCard className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-slate-800 mb-2 tracking-tight">No ID Card Generated</h3>
                        <p className="text-slate-500 font-medium mb-8 max-w-sm">You haven&apos;t generated your digital member identity card yet.</p>
                        
                        {profile.isApproved ? (
                            <Button
                                onClick={generateIDCard}
                                disabled={generating}
                                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 transition-all font-bold tracking-wide h-12 px-8"
                            >
                                {generating ? (
                                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Generating Card...</>
                                ) : (
                                    <><CreditCard className="w-5 h-5 mr-3" /> Generate ID Card</>
                                )}
                            </Button>
                        ) : (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 max-w-sm">
                                <p className="text-sm font-bold text-orange-700 uppercase tracking-widest text-[11px]">Pending Approval</p>
                                <p className="text-sm font-medium text-orange-600 mt-1">Your membership must be approved by an administrator before you can generate an ID card.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
