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
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">My ID Card</h1>
                <p className="text-slate-500 text-sm mt-1">Your digital membership card</p>
            </div>

            {idCard ? (
                <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Card Front */}
                    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-6 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Nirashray Foundation</p>
                                <p className="text-xs text-blue-300">Member Identity Card</p>
                            </div>
                            <Badge className="bg-white/20 text-white text-xs">
                                {profile.membershipType}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-5">
                            {/* Photo */}
                            <div className="w-20 h-24 rounded-xl border-2 border-white/30 overflow-hidden flex-shrink-0 bg-white/10">
                                {profile.user.image ? (
                                    <Image src={profile.user.image} alt={profile.user.name} width={80} height={96} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white/50">{getInitials(profile.user.name)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-xl font-bold">{profile.user.name}</p>
                                <p className="text-blue-200 text-sm mt-0.5">{profile.user.email}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                                    <div>
                                        <p className="text-[10px] text-blue-300 uppercase">Member ID</p>
                                        <p className="text-sm font-mono font-bold">{profile.memberId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-300 uppercase">Card No</p>
                                        <p className="text-sm font-mono font-bold">{idCard.cardNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-300 uppercase">Joined</p>
                                        <p className="text-sm">{formatDate(new Date(profile.joinDate))}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-300 uppercase">Valid Until</p>
                                        <p className="text-sm">{formatDate(new Date(idCard.expiryDate))}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code */}
                            {idCard.qrCodeData && (
                                <div className="w-20 h-20 bg-white rounded-lg p-1 shrink-0">
                                    <Image src={idCard.qrCodeData} alt="QR Code" width={72} height={72} className="w-full h-full" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-blue-950 px-6 py-3 flex items-center justify-between">
                        <p className="text-[10px] text-blue-300">This card is the property of Nirashray Foundation</p>
                        <p className="text-[10px] text-blue-300">www.nirashray.org</p>
                    </div>
                </Card>
            ) : (
                <Card className="border-0 shadow-sm">
                    <CardContent className="py-12 text-center">
                        <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">No ID card generated yet.</p>
                        {profile.isApproved ? (
                            <Button
                                onClick={generateIDCard}
                                disabled={generating}
                                className="bg-blue-800 hover:bg-blue-900 text-white"
                            >
                                {generating ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                ) : (
                                    <><CreditCard className="w-4 h-4 mr-2" /> Generate ID Card</>
                                )}
                            </Button>
                        ) : (
                            <p className="text-sm text-orange-500">Your membership must be approved before generating an ID card.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Instructions */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-800 text-sm mb-2">About your ID Card</h3>
                    <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                        <li>Your digital ID card serves as proof of membership with Nirashray Foundation.</li>
                        <li>The QR code on your card can be scanned to verify your membership.</li>
                        <li>Screenshot or print this card for offline use.</li>
                        <li>Contact admin if the details on your card are incorrect.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
