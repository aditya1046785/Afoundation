"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Download, Loader2, QrCode } from "lucide-react";
import Image from "next/image";
import { getInitials, formatDate } from "@/lib/utils";
import { downloadIDCardPDF } from "@/lib/pdf-generator";

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
    const [downloading, setDownloading] = useState(false);
    const [adminSignature, setAdminSignature] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            const res = await fetch("/api/members/me");
            const data = await res.json();
            if (data.success) setProfile(data.data);
            setLoading(false);
        }

        async function fetchSignature() {
            const res = await fetch("/api/site-settings?keys=admin_signature");
            const data = await res.json();
            if (data.success) setAdminSignature(data.data?.admin_signature || "");
        }

        fetchProfile();
        fetchSignature();
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

    const handleDownloadPDF = async () => {
        if (!profile?.user?.name || !idCard) return;

        try {
            setDownloading(true);

            await downloadIDCardPDF("member-id-card-preview", profile.user.name);

            toast.success("ID card PDF downloaded successfully.");
        } catch (error) {
            console.error("Failed to download ID card PDF:", error);
            toast.error("Failed to download ID card PDF.");
        } finally {
            setDownloading(false);
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

    const exportCardStyles = {
        container: {
            width: 856,
            height: 540,
            backgroundColor: "#ffffff",
            border: "4px solid #f97316",
            borderRadius: 24,
            padding: 20,
            boxSizing: "border-box" as const,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column" as const,
            fontFamily: "Arial, Helvetica, sans-serif",
            boxShadow: "0 25px 50px rgba(15, 23, 42, 0.18)",
        },
        header: {
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: 18,
            padding: "14px 16px 16px",
            minHeight: 96,
            color: "#ffffff",
            textAlign: "center" as const,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
        },
        headerTitle: {
            margin: 0,
            fontSize: 18,
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: "0.04em",
        },
        headerSubtitle: {
            margin: "4px 0 0",
            fontSize: 10,
            color: "#cbd5e1",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
        },
        badge: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative" as const,
            minWidth: 98,
            marginTop: 10,
            padding: "6px 13px",
            borderRadius: 9999,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            lineHeight: 1,
            whiteSpace: "nowrap" as const,
            color: "#ffffff",
            background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
            boxShadow: "0 6px 16px rgba(249, 115, 22, 0.28)",
        },
        body: {
            marginTop: 16,
            display: "flex",
            flexDirection: "column" as const,
            gap: 14,
            flex: 1,
        },
        identityRow: {
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 16,
            flexShrink: 0,
        },
        avatarWrap: {
            width: 140,
            height: 180,
            margin: 0,
            borderRadius: 18,
            background: "linear-gradient(135deg, #fed7aa 0%, #f97316 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 30px rgba(249, 115, 22, 0.25)",
            border: "4px solid #ffffff",
            color: "#7c2d12",
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "0.02em",
        },
        qrColumn: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: 8,
        },
        identityText: {
            padding: "0 6px",
            textAlign: "center" as const,
        },
        nameEmailWrap: {
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "center",
        },
        name: {
            margin: 0,
            fontSize: 31,
            fontWeight: 800,
            color: "#111827",
            textAlign: "center" as const,
            lineHeight: 1.1,
            padding: 0,
            wordBreak: "break-word" as const,
        },
        email: {
            margin: "8px 0 0",
            fontSize: 14,
            color: "#4b5563",
            textAlign: "center" as const,
            fontWeight: 500,
            padding: 0,
            wordBreak: "break-word" as const,
        },
        details: {
            marginTop: 2,
            padding: 16,
            minHeight: 124,
            borderRadius: 16,
            backgroundColor: "#f8fafc",
            border: "1px solid #e5e7eb",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 18,
            rowGap: 12,
        },
        signatureWrap: {
            marginTop: 4,
            paddingTop: 12,
            borderTop: "1px solid #f3d7b2",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "flex-end",
            gap: 6,
        },
        signatureLabel: {
            margin: 0,
            fontSize: 10,
            color: "#7c2d12",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
        },
        signatureBox: {
            width: 180,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
        },
        signatureImage: {
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain" as const,
            display: "block",
        },
        label: {
            margin: 0,
            fontSize: 11,
            color: "#6b7280",
            fontWeight: 600,
            lineHeight: 1.2,
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
        },
        value: {
            margin: "4px 0 0",
            fontSize: 14,
            color: "#111827",
            fontWeight: 700,
            lineHeight: 1.25,
            wordBreak: "break-word" as const,
        },
        qrBox: {
            width: 140,
            height: 140,
            backgroundColor: "#ffffff",
            border: "2px solid #d1d5db",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 20px rgba(15, 23, 42, 0.12)",
            padding: 10,
        },
        qrImage: {
            width: 116,
            height: 116,
            objectFit: "contain" as const,
            display: "block",
        },
        qrText: {
            margin: 0,
            fontSize: 12,
            color: "#374151",
            fontWeight: 700,
            textAlign: "center" as const,
        },
        footer: {
            marginTop: "auto",
            minHeight: 44,
            backgroundColor: "#fef3c7",
            borderRadius: 12,
            padding: "10px 12px",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center" as const,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        footerText: {
            margin: 0,
            fontSize: 11,
            color: "#92400e",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
        },
    } as const;

    return (
        <div className="space-y-8 max-w-4xl mx-auto relative z-10 pb-10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-200 h-200 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-150 h-150 bg-blue-300/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-sm">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">My ID Card</h1>
                    <p className="text-slate-500 font-medium text-sm mt-2 flex items-center gap-2">
                        Your digital membership identity
                    </p>
                </div>
                {idCard && (
                    <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="bg-white/80 border-slate-200 shadow-sm font-semibold tracking-wide text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" /> Download ID
                            </>
                        )}
                    </Button>
                )}
            </div>

            {idCard ? (
                <div className="flex flex-col lg:flex-row gap-8 items-start justify-center pt-4">
                    {/* The ID Card Container */}
                    <div className="flex justify-center flex-1 w-full lg:w-auto relative group overflow-x-auto">
                        <div
                            id="member-id-card-preview"
                            className="bg-[#fdfcfa] rounded-[2rem] p-1 shadow-2xl shadow-amber-900/15 border border-amber-900/10 relative overflow-hidden transform-gpu transition-all duration-700 hover:scale-[1.01] hover:shadow-amber-900/20"
                            style={{ width: 856, height: 540 }}
                        >
                            {/* Inner stroke */}
                            <div className="absolute inset-2 rounded-3xl border border-amber-900/10 pointer-events-none z-20" />

                            {/* Background Textures */}
                            <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-75 h-75 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-75 h-75 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

                            {/* Content */}
                            <div className="relative h-full flex flex-col bg-white/40 backdrop-blur-sm rounded-[1.75rem] overflow-hidden">
                                {/* Header */}
                                <div className="px-8 pt-8 pb-5 text-center relative z-10">
                                    <p className="font-serif text-amber-800 font-bold text-xl tracking-tight leading-tight">Nirashray</p>
                                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">Foundation</p>

                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 shadow-sm text-[9px] uppercase tracking-widest font-bold px-3">
                                            {profile.membershipType}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Photo, QR, and identity */}
                                <div className="px-8 pt-2 pb-1 relative z-10 flex flex-col items-center gap-4">
                                    <div className="flex items-start gap-6 justify-center w-full">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-linear-to-tr from-amber-400 to-amber-200 rounded-[18px] blur opacity-35 group-hover:opacity-50 transition-opacity duration-500" />
                                            <div
                                                className="rounded-[18px] border-4 border-white shadow-xl shadow-amber-900/10 overflow-hidden bg-amber-50 relative group-hover:scale-[1.02] transition-transform duration-500"
                                                style={{ width: 140, height: 180 }}
                                            >
                                                {profile.user.image ? (
                                                    <Image src={profile.user.image} alt={profile.user.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-100 to-amber-50">
                                                        <span className="text-4xl font-serif font-bold text-amber-700/50">{getInitials(profile.user.name)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 pt-1">
                                            {idCard.qrCodeData && (
                                                <div
                                                    className="bg-white rounded-2xl p-2 shrink-0 shadow-md shadow-amber-900/5 border border-white group-hover:shadow-lg transition-shadow duration-500"
                                                    style={{ width: 140, height: 140 }}
                                                >
                                                    <Image src={idCard.qrCodeData} alt="QR Code" width={124} height={124} className="w-full h-full mix-blend-multiply" />
                                                </div>
                                            )}
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">Scan to verify</p>
                                        </div>
                                    </div>

                                    <div className="w-full text-center" style={{ maxWidth: 620 }}>
                                        <h3 className="font-serif text-[32px] font-bold text-slate-800 leading-tight tracking-tight">{profile.user.name}</h3>
                                        <p className="text-sm font-semibold text-slate-500 mt-2 break-all">{profile.user.email}</p>
                                        <div className="space-y-1.5 mt-4">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Member Identity</p>
                                            <p className="text-[11px] uppercase tracking-widest text-amber-700/80 font-bold">Valid & Verified</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="px-6 py-5 bg-white/70 mx-8 rounded-2xl border border-white shadow-sm mt-2 relative z-10">
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
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

                                {/* Signature */}
                                <div className="mt-auto px-8 pb-5 pt-4 relative z-10">
                                    <div className="flex flex-col items-end gap-2 border-t border-amber-900/10 pt-4">
                                        <p className="text-[10px] uppercase tracking-widest text-amber-800/70 font-bold">Founder / President</p>
                                        <div className="flex items-center justify-end" style={{ width: 190, height: 54 }}>
                                            {adminSignature ? (
                                                <Image
                                                    src={adminSignature}
                                                    alt="Founder / President Signature"
                                                    width={190}
                                                    height={54}
                                                    className="w-auto object-contain"
                                                    style={{ maxHeight: 54 }}
                                                />
                                            ) : (
                                                <div className="w-full border-b border-dashed border-amber-300 h-8" />
                                            )}
                                        </div>
                                    </div>
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
                                        <p>You can screenshot, download, or print this card for offline use during events.</p>
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

            {idCard && (
                <div
                    id="member-id-card-export"
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: "-9999px",
                        top: "-9999px",
                        zIndex: -9999,
                        visibility: "hidden",
                        pointerEvents: "none",
                        width: 856,
                        height: 540,
                        overflow: "hidden",
                    }}
                >
                    <div style={exportCardStyles.container}>
                        <div style={exportCardStyles.header}>
                            <p style={exportCardStyles.headerTitle}>NIRASHRAY FOUNDATION</p>
                            <p style={exportCardStyles.headerSubtitle}>Official Member Identity Card</p>
                            <div style={exportCardStyles.badge}>{profile.membershipType}</div>
                        </div>

                        <div style={exportCardStyles.body}>
                            <div style={exportCardStyles.identityRow}>
                                <div style={exportCardStyles.avatarWrap}>{getInitials(profile.user.name)}</div>
                                <div style={exportCardStyles.qrColumn}>
                                    {idCard.qrCodeData && (
                                        <div style={exportCardStyles.qrBox}>
                                            <img
                                                src={idCard.qrCodeData}
                                                alt="QR Code"
                                                width={116}
                                                height={116}
                                                style={{
                                                    ...exportCardStyles.qrImage,
                                                    imageRendering: "-webkit-optimize-contrast",
                                                }}
                                            />
                                        </div>
                                    )}
                                    <p style={exportCardStyles.qrText}>Scan to verify membership</p>
                                </div>
                            </div>

                            <div style={exportCardStyles.identityText}>
                                <div style={exportCardStyles.nameEmailWrap}>
                                    <p style={exportCardStyles.name}>{profile.user.name}</p>
                                    <p style={exportCardStyles.email}>{profile.user.email}</p>
                                </div>
                            </div>

                            <div style={exportCardStyles.details}>
                                <div>
                                    <p style={exportCardStyles.label}>Member ID</p>
                                    <p style={exportCardStyles.value}>{profile.memberId}</p>
                                </div>
                                <div>
                                    <p style={exportCardStyles.label}>Card No</p>
                                    <p style={exportCardStyles.value}>{idCard.cardNumber}</p>
                                </div>
                                <div>
                                    <p style={exportCardStyles.label}>Joined</p>
                                    <p style={exportCardStyles.value}>{formatDate(new Date(profile.joinDate))}</p>
                                </div>
                                <div>
                                    <p style={exportCardStyles.label}>Valid Until</p>
                                    <p style={exportCardStyles.value}>{formatDate(new Date(idCard.expiryDate))}</p>
                                </div>
                            </div>

                            <div style={exportCardStyles.signatureWrap}>
                                <p style={exportCardStyles.signatureLabel}>Founder / President</p>
                                <div style={exportCardStyles.signatureBox}>
                                    {adminSignature ? (
                                        <img
                                            src={adminSignature}
                                            alt="Founder / President Signature"
                                            width={180}
                                            height={48}
                                            style={exportCardStyles.signatureImage}
                                        />
                                    ) : (
                                        <div style={{ width: "100%", borderBottom: "1px dashed #e7c18f", height: 22 }} />
                                    )}
                                </div>
                            </div>

                            <div style={exportCardStyles.footer}>
                                <p style={exportCardStyles.footerText}>Digital Member Identity Card</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
