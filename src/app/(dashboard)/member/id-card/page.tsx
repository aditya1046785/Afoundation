"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Download, Loader2, QrCode } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";

interface IDCard {
    id: string; cardNumber: string; expiryDate: string; qrCodeData: string | null;
}
interface MemberProfile {
    id: string; memberId: string; membershipType: string; isApproved: boolean;
    joinDate: string; address: string | null; city: string | null; state: string | null;
    user: { name: string; email: string; image: string | null; phone: string | null; };
    idCards: IDCard[];
}

const CARD_W = 591;
const CARD_H = 1004;
const GAP = 28;
const COMBINED_W = CARD_W * 2 + GAP;

export default function MemberIDCardPage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<MemberProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [adminSignature, setAdminSignature] = useState("");
    const previewRef = useRef<HTMLDivElement>(null);

    // scale yahan calculate karo taaki handleDownloadPDF mein bhi access ho
    const MAX_W = 680;
    const scale = Math.min(1, MAX_W / COMBINED_W);
    const previewW = Math.round(COMBINED_W * scale);
    const previewH = Math.round(CARD_H * scale);

    useEffect(() => {
        async function load() {
            const [r1, r2] = await Promise.all([
                fetch("/api/members/me"),
                fetch("/api/site-settings?keys=admin_signature")
            ]);
            const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
            if (d1.success) setProfile(d1.data);
            if (d2.success) setAdminSignature(d2.data?.admin_signature || "");
            setLoading(false);
        }
        load();
    }, []);

    const generateIDCard = async () => {
        setGenerating(true);
        try {
            const res = await fetch("/api/id-cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("ID Card generated!");
                const r2 = await fetch("/api/members/me");
                const d2 = await r2.json();
                if (d2.success) setProfile(d2.data);
            } else toast.error(data.error || "Failed to generate.");
        } catch { toast.error("An error occurred."); }
        finally { setGenerating(false); }
    };

    const handleDownloadPDF = async () => {
        if (!profile || !previewRef.current) return;
        const idCard = profile.idCards?.[0];
        if (!idCard) return;

        setDownloading(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const el = previewRef.current;
            const parent = el.parentElement!;

            // Step 1: Transform hatao, full size dikha do
            el.style.transform = "none";
            el.style.transformOrigin = "top left";
            el.style.width = `${COMBINED_W}px`;
            el.style.height = `${CARD_H}px`;

            // Step 2: Parent overflow fix
            const prevStyles = {
                overflow: parent.style.overflow,
                width: parent.style.width,
                height: parent.style.height,
                borderRadius: parent.style.borderRadius,
            };
            parent.style.overflow = "visible";
            parent.style.width = `${COMBINED_W}px`;
            parent.style.height = `${CARD_H}px`;
            parent.style.borderRadius = "0";

            // Step 3: Browser re-render ka wait
            await new Promise(r => setTimeout(r, 150));

            // Step 4: Capture
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: COMBINED_W,
                height: CARD_H,
                backgroundColor: "#f5f0eb",
                onclone: (_doc: Document, clonedEl: HTMLElement) => {
                    // lab() error fix - sab stylesheets hata do
                    clonedEl.ownerDocument
                        .querySelectorAll('link[rel="stylesheet"], style')
                        .forEach(e => e.remove());
                    // Transform ensure none hai clone mein bhi
                    clonedEl.style.transform = "none";
                    clonedEl.style.width = `${COMBINED_W}px`;
                    clonedEl.style.height = `${CARD_H}px`;
                    clonedEl.style.overflow = "visible";
                },
            });

            // Step 5: Sab wapas restore karo
            el.style.transform = `scale(${scale})`;
            el.style.transformOrigin = "top left";
            el.style.width = `${COMBINED_W}px`;
            el.style.height = `${CARD_H}px`;
            parent.style.overflow = prevStyles.overflow;
            parent.style.width = prevStyles.width;
            parent.style.height = prevStyles.height;
            parent.style.borderRadius = prevStyles.borderRadius;

            // Step 6: PDF generate
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [COMBINED_W, CARD_H],
            });
            pdf.addImage(
                canvas.toDataURL("image/png"),
                "PNG", 0, 0, COMBINED_W, CARD_H
            );
            pdf.save(
                `${(profile.user.name || "member").replace(/\s+/g, "_")}_ID_Card.pdf`
            );
            toast.success("PDF downloaded!");

        } catch (e) {
            console.error(e);
            toast.error("Failed to download PDF.");
            // Restore on error bhi
            if (previewRef.current) {
                previewRef.current.style.transform = `scale(${scale})`;
                previewRef.current.style.width = `${COMBINED_W}px`;
                previewRef.current.style.height = `${CARD_H}px`;
            }
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="h-8 bg-slate-100 rounded w-40 animate-pulse" />
            <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
    );

    if (!profile) return (
        <div className="max-w-2xl mx-auto py-20 text-center">
            <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No member profile linked to your account.</p>
            <p className="text-slate-400 text-sm">
                {session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"
                    ? "As an admin, you don't have a member profile."
                    : "Please contact admin to set up your membership profile."}
            </p>
        </div>
    );

    const idCard = profile.idCards?.[0] || null;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-sm">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
                        My ID Card
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">Your digital membership identity</p>
                </div>
                {idCard && (
                    <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="bg-white/80 border-slate-200 font-semibold text-amber-700 hover:bg-amber-50"
                    >
                        {downloading
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Downloading...</>
                            : <><Download className="w-4 h-4 mr-2" />Download PDF</>}
                    </Button>
                )}
            </div>

            {idCard ? (
                <div className="flex flex-col xl:flex-row gap-8 items-start pt-2">
                    {/* Preview */}
                    <div className="flex-1">
                        {/* Outer box - clips preview to scaled size */}
                        <div
                            style={{
                                width: previewW,
                                height: previewH,
                                overflow: "hidden",
                                borderRadius: 16,
                                position: "relative",
                            }}
                            className="shadow-2xl shadow-amber-900/20 mx-auto"
                        >
                            {/* Inner full-res div - scaled for preview, captured at full res */}
                            <div
                                ref={previewRef}
                                style={{
                                    width: COMBINED_W,
                                    height: CARD_H,
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top left",
                                    display: "flex",
                                    gap: GAP,
                                    background: "#f5f0eb",
                                    fontFamily: "Arial, Helvetica, sans-serif",
                                }}
                            >
                                <FrontCard
                                    profile={profile}
                                    idCard={idCard}
                                    adminSignature={adminSignature}
                                />
                                <BackCard
                                    joinDate={profile.joinDate}
                                    expiryDate={idCard.expiryDate}
                                />
                            </div>
                        </div>

                        {/* Labels */}
                        <div style={{ width: previewW }} className="flex mx-auto mt-3">
                            <p
                                className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center"
                                style={{ width: Math.round(CARD_W * scale) }}
                            >Front</p>
                            <p
                                className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center"
                                style={{
                                    width: Math.round(CARD_W * scale),
                                    marginLeft: Math.round(GAP * scale)
                                }}
                            >Back</p>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="w-full xl:w-[270px] shrink-0">
                        <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg sticky top-32">
                            <CardHeader className="pb-4 border-b border-slate-100/50 bg-white/40">
                                <CardTitle className="text-[14px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <QrCode className="w-4 h-4 text-amber-600" /> About ID Card
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <ul className="text-sm text-slate-600 space-y-3">
                                    {[
                                        "Proof of membership with Nirashray Foundation.",
                                        "QR code verifies membership status instantly.",
                                        "PDF contains both front and back on one page.",
                                    ].map(t => (
                                        <li key={t} className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                                            <p>{t}</p>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
                                    {[
                                        ["Member ID", profile.memberId],
                                        ["Card No", idCard.cardNumber],
                                        ["Valid Until", formatDate(new Date(idCard.expiryDate))],
                                        ["Type", profile.membershipType],
                                    ].map(([l, v]) => (
                                        <div key={l} className="flex justify-between text-xs">
                                            <span className="text-slate-500 font-semibold uppercase tracking-wide">{l}</span>
                                            <span className="text-slate-800 font-bold">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg">
                    <CardContent className="py-20 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                            <CreditCard className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-slate-800 mb-2">
                            No ID Card Generated
                        </h3>
                        <p className="text-slate-500 mb-8 max-w-sm">
                            You haven&apos;t generated your digital member identity card yet.
                        </p>
                        {profile.isApproved ? (
                            <Button
                                onClick={generateIDCard}
                                disabled={generating}
                                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold h-12 px-8"
                            >
                                {generating
                                    ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" />Generating...</>
                                    : <><CreditCard className="w-5 h-5 mr-3" />Generate ID Card</>}
                            </Button>
                        ) : (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 max-w-sm">
                                <p className="text-[11px] font-bold text-orange-700 uppercase tracking-widest">
                                    Pending Approval
                                </p>
                                <p className="text-sm text-orange-600 mt-1">
                                    Your membership must be approved before generating an ID card.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ── Front Card ────────────────────────────────────────────────────
function FrontCard({ profile, idCard, adminSignature }: {
    profile: MemberProfile; idCard: IDCard; adminSignature: string;
}) {
    const addr = [profile.address, profile.city, profile.state]
        .filter(Boolean).join(", ") || "—";

    return (
        <div style={{
            width: CARD_W, height: CARD_H,
            position: "relative", overflow: "hidden",
            flexShrink: 0, fontFamily: "Arial, Helvetica, sans-serif",
        }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/id-card-front-bg.png" alt=""
                crossOrigin="anonymous"
                style={{
                    position: "absolute", top: 0, left: 0,
                    width: "100%", height: "100%", objectFit: "fill",
                }}
            />

            {/* Photo + QR */}
            <div style={{
                position: "absolute", top: 280, left: 0, right: 0,
                display: "flex", justifyContent: "center", gap: 26,
            }}>
                <div style={{
                    width: 160, height: 190, borderRadius: 13,
                    overflow: "hidden", border: "4px solid #fff",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
                    background: "#f2dece", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    {profile.user.image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={profile.user.image} alt=""
                            crossOrigin="anonymous"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: 46, fontWeight: 800, color: "#7c2d12" }}>
                            {getInitials(profile.user.name)}
                          </span>
                    }
                </div>

                <div style={{
                    width: 150, height: 150, borderRadius: 13,
                    background: "#fff", border: "3px solid #ddc9b4",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                    padding: 5, boxShadow: "0 4px 18px rgba(0,0,0,0.10)",
                }}>
                    {idCard.qrCodeData
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={idCard.qrCodeData} alt="QR"
                            style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        : <span style={{ fontSize: 10, color: "#aaa" }}>QR N/A</span>
                    }
                </div>
            </div>

            {/* Text fields */}
            {[
                { top: 525, value: profile.user.name,        fs: 26, fw: 700, mono: false, ml: false },
                { top: 588, value: profile.memberId,         fs: 24, fw: 700, mono: true,  ml: false },
                { top: 653, value: profile.user.email,       fs: 22, fw: 600, mono: false, ml: false },
                { top: 727, value: addr,                     fs: 22, fw: 600, mono: false, ml: true  },
                { top: 783, value: profile.user.phone || "—",fs: 24, fw: 700, mono: false, ml: false },
            ].map(({ top, value, fs, fw, mono, ml }) => (
                <div key={top} style={{
                    position: "absolute", top, left: 182, right: 22, overflow: "hidden",
                }}>
                    <span style={{
                        fontSize: fs, fontWeight: fw, color: "#2c1008",
                        fontFamily: mono ? "monospace" : "Arial, Helvetica, sans-serif",
                        lineHeight: ml ? 1.25 : 1,
                        display: "block",
                        whiteSpace: ml ? "normal" : "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}>{value}</span>
                </div>
            ))}

            {/* Signature */}
            {adminSignature && (
                <div style={{
                    position: "absolute", bottom: 150, right: 34,
                    width: 162, height: 48,
                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={adminSignature} alt="sig"
                        crossOrigin="anonymous"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                </div>
            )}
        </div>
    );
}

// ── Back Card ─────────────────────────────────────────────────────
function BackCard({ joinDate, expiryDate }: { joinDate: string; expiryDate: string }) {
    return (
        <div style={{
            width: CARD_W, height: CARD_H,
            position: "relative", overflow: "hidden",
            flexShrink: 0, fontFamily: "Arial, Helvetica, sans-serif",
        }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/id-card-back-bg.png" alt=""
                crossOrigin="anonymous"
                style={{
                    position: "absolute", top: 0, left: 0,
                    width: "100%", height: "100%", objectFit: "fill",
                }}
            />
            <div style={{ position: "absolute", top: 542, left: 268 }}>
                <span style={{
                    fontSize: 21, fontWeight: 700, color: "#2c1008",
                    whiteSpace: "nowrap", fontFamily: "Arial, Helvetica, sans-serif",
                }}>
                    {formatDate(new Date(joinDate))}
                </span>
            </div>
            <div style={{ position: "absolute", top: 591, left: 268 }}>
                <span style={{
                    fontSize: 21, fontWeight: 700, color: "#2c1008",
                    whiteSpace: "nowrap", fontFamily: "Arial, Helvetica, sans-serif",
                }}>
                    {formatDate(new Date(expiryDate))}
                </span>
            </div>
        </div>
    );
}