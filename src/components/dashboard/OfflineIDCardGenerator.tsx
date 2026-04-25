"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, QrCode, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatDate, getInitials } from "@/lib/utils";

type FormState = {
    fullName: string;
    memberId: string;
    membershipType: "GENERAL" | "LIFETIME" | "HONORARY" | "STUDENT";
    email: string;
    phone: string;
    position: string;
    address: string;
    city: string;
    state: string;
    joinDate: string;
    expiryDate: string;
    photoUrl: string;
};

const CARD_W = 591;
const CARD_H = 1004;
const GAP = 28;
const COMBINED_W = CARD_W * 2 + GAP;
const MAX_W = 680;

function dateInputValue(daysFromNow = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().slice(0, 10);
}

function sanitizeIntMonths(joinDate: string, expiryDate: string): number {
    const from = joinDate ? new Date(joinDate) : new Date();
    const to = expiryDate ? new Date(expiryDate) : new Date(from);
    const diffMs = Math.max(0, to.getTime() - from.getTime());
    const months = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30));
    return Math.max(1, months || 12);
}

export default function OfflineIDCardGenerator() {
    const scale = Math.min(1, MAX_W / COMBINED_W);
    const previewW = Math.round(COMBINED_W * scale);
    const previewH = Math.round(CARD_H * scale);

    const [adminSignature, setAdminSignature] = useState("");
    const [loadingSignature, setLoadingSignature] = useState(true);
    const [savingMember, setSavingMember] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [savedMemberRecordId, setSavedMemberRecordId] = useState<string | null>(null);
    const [cardNumber, setCardNumber] = useState<string>("AUTO");

    const [form, setForm] = useState<FormState>({
        fullName: "",
        memberId: "",
        membershipType: "GENERAL",
        email: "",
        phone: "",
        position: "",
        address: "",
        city: "",
        state: "",
        joinDate: dateInputValue(0),
        expiryDate: dateInputValue(365),
        photoUrl: "",
    });

    const previewRef = useRef<HTMLDivElement>(null);

    const fullAddress = useMemo(() => {
        return [form.address, form.city, form.state].filter(Boolean).join(", ") || "-";
    }, [form.address, form.city, form.state]);

    const canSaveMember =
        form.fullName.trim().length > 0 &&
        form.email.trim().length > 0 &&
        form.phone.trim().length > 0 &&
        form.position.trim().length > 0;

    const canDownload =
        form.fullName.trim().length > 0 &&
        form.memberId.trim().length > 0 &&
        form.email.trim().length > 0;

    useEffect(() => {
        async function loadSignature() {
            try {
                const res = await fetch("/api/site-settings?keys=admin_signature");
                const data = await res.json();
                if (data.success) {
                    setAdminSignature(data.data?.admin_signature || "");
                }
            } catch {
                // Silent failure; signature is optional in the card layout.
            } finally {
                setLoadingSignature(false);
            }
        }

        loadSignature();
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function buildQRCode() {
            if (!form.memberId.trim()) {
                setQrCodeData(null);
                return;
            }

            try {
                const QRCode = await import("qrcode");
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                const payload = JSON.stringify({
                    type: "OFFLINE_MEMBER_CARD",
                    id: form.memberId,
                    name: form.fullName,
                    cardNo: cardNumber,
                    url: origin ? `${origin}/verify/${encodeURIComponent(form.memberId)}` : undefined,
                });
                const dataUrl = await QRCode.toDataURL(payload, {
                    errorCorrectionLevel: "H",
                    width: 300,
                    color: {
                        dark: "#000000",
                        light: "#FFFFFF",
                    },
                });
                if (!cancelled) setQrCodeData(dataUrl);
            } catch {
                if (!cancelled) setQrCodeData(null);
            }
        }

        buildQRCode();
        return () => {
            cancelled = true;
        };
    }, [form.memberId, form.fullName, cardNumber]);

    const updateForm = (key: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const onPhotoFileSelected = async (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            if (!result) {
                toast.error("Failed to read selected image.");
                return;
            }
            updateForm("photoUrl", result);
            toast.success("Photo selected.");
        };
        reader.onerror = () => {
            toast.error("Failed to load selected image.");
        };
        reader.readAsDataURL(file);
    };

    const handleSaveMember = async () => {
        if (!canSaveMember) {
            toast.error("Name, email, phone, and position are required.");
            return;
        }
        if (savedMemberRecordId) {
            toast.success("Member already saved in foundation records.");
            return;
        }

        setSavingMember(true);
        try {
            const createRes = await fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.fullName.trim(),
                    email: form.email.trim().toLowerCase(),
                    phone: form.phone.trim(),
                    position: form.position.trim(),
                    membershipType: form.membershipType,
                    address: form.address.trim() || undefined,
                    city: form.city.trim() || undefined,
                    state: form.state.trim() || undefined,
                    photo: form.photoUrl || undefined,
                    isApproved: true,
                }),
            });

            const createData = await createRes.json();
            if (!createData.success) {
                toast.error(createData.error || "Failed to save member.");
                return;
            }

            const memberRecordId = createData.data?.memberRecordId as string;
            const publicMemberId = createData.data?.memberId as string;
            setSavedMemberRecordId(memberRecordId || null);
            if (publicMemberId) {
                setForm((prev) => ({ ...prev, memberId: publicMemberId }));
            }

            if (memberRecordId) {
                const months = sanitizeIntMonths(form.joinDate, form.expiryDate);
                const cardRes = await fetch("/api/id-cards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId: memberRecordId, expiryMonths: months }),
                });
                const cardData = await cardRes.json();
                if (cardData.success) {
                    const issuedCardNo = cardData.data?.cardNumber as string | undefined;
                    const issuedExpiry = cardData.data?.expiryDate as string | undefined;
                    if (issuedCardNo) setCardNumber(issuedCardNo);
                    if (issuedExpiry) {
                        setForm((prev) => ({ ...prev, expiryDate: issuedExpiry.slice(0, 10) }));
                    }
                }
            }

            toast.success("Member saved and Member ID generated automatically.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save member.");
        } finally {
            setSavingMember(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!previewRef.current || !canDownload) {
            toast.error("Save member first to generate Member ID.");
            return;
        }

        const el = previewRef.current;
        const parent = el.parentElement;
        if (!parent) return;

        const prevElStyles = {
            transform: el.style.transform,
            transformOrigin: el.style.transformOrigin,
            width: el.style.width,
            height: el.style.height,
        };
        const prevParentStyles = {
            overflow: parent.style.overflow,
            width: parent.style.width,
            height: parent.style.height,
            borderRadius: parent.style.borderRadius,
        };

        setDownloading(true);
        try {
            const { toPng } = await import("html-to-image");
            const jsPDF = (await import("jspdf")).default;

            el.style.transform = "none";
            el.style.transformOrigin = "top left";
            el.style.width = `${COMBINED_W}px`;
            el.style.height = `${CARD_H}px`;

            parent.style.overflow = "visible";
            parent.style.width = `${COMBINED_W}px`;
            parent.style.height = `${CARD_H}px`;
            parent.style.borderRadius = "0";

            await new Promise((r) => setTimeout(r, 120));

            const imgData = await toPng(el, {
                pixelRatio: 3,
                cacheBust: true,
                width: COMBINED_W,
                height: CARD_H,
                backgroundColor: "#f5f0eb",
            });

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [COMBINED_W, CARD_H],
            });
            pdf.addImage(imgData, "PNG", 0, 0, COMBINED_W, CARD_H);

            const safeName = (form.fullName || "offline-member").trim().replace(/\s+/g, "_");
            pdf.save(`${safeName}_ID_Card.pdf`);
            toast.success("ID card PDF downloaded.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download ID card PDF.");
        } finally {
            el.style.transform = prevElStyles.transform;
            el.style.transformOrigin = prevElStyles.transformOrigin;
            el.style.width = prevElStyles.width;
            el.style.height = prevElStyles.height;

            parent.style.overflow = prevParentStyles.overflow;
            parent.style.width = prevParentStyles.width;
            parent.style.height = prevParentStyles.height;
            parent.style.borderRadius = prevParentStyles.borderRadius;

            setDownloading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white/70 border border-white/60 rounded-3xl p-6 shadow-sm">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Offline ID Card Generator</h1>
                    <p className="text-sm text-slate-500 mt-1">Create foundation member entry, auto-generate Member ID, and download ID card.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleSaveMember} disabled={savingMember || !canSaveMember || Boolean(savedMemberRecordId)} variant="outline">
                        {savingMember ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" />Save Member Entry</>
                        )}
                    </Button>
                    <Button onClick={handleDownloadPDF} disabled={downloading || !canDownload} className="bg-amber-600 hover:bg-amber-700 text-white">
                        {downloading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Downloading...</>
                        ) : (
                            <><Download className="w-4 h-4 mr-2" />Download PDF</>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid xl:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start">
                <Card className="rounded-3xl border border-slate-200/70">
                    <CardHeader>
                        <CardTitle className="text-base">Member Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input id="fullName" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} placeholder="Enter full name" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="memberId">Member ID (Auto)</Label>
                                <Input id="memberId" value={form.memberId || "Will generate after save"} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="membershipType">Membership Type</Label>
                                <Select value={form.membershipType} onValueChange={(v) => setForm((prev) => ({ ...prev, membershipType: v as FormState["membershipType"] }))}>
                                    <SelectTrigger id="membershipType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GENERAL">General</SelectItem>
                                        <SelectItem value="LIFETIME">Lifetime</SelectItem>
                                        <SelectItem value="HONORARY">Honorary</SelectItem>
                                        <SelectItem value="STUDENT">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="member@example.com" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input id="phone" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="9876543210" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Position In Foundation *</Label>
                                <Input id="position" value={form.position} onChange={(e) => updateForm("position", e.target.value)} placeholder="Volunteer / Manager" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="House no, street, area" className="min-h-20" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" value={form.city} onChange={(e) => updateForm("city", e.target.value)} placeholder="City" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" value={form.state} onChange={(e) => updateForm("state", e.target.value)} placeholder="State" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="joinDate">Join Date</Label>
                                <Input id="joinDate" type="date" value={form.joinDate} onChange={(e) => updateForm("joinDate", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input id="expiryDate" type="date" value={form.expiryDate} onChange={(e) => updateForm("expiryDate", e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photoUpload">Photo Upload</Label>
                            <label
                                htmlFor="photoUpload"
                                className="h-10 border border-slate-200 rounded-md px-3 text-sm flex items-center cursor-pointer hover:bg-slate-50"
                            >
                                <Upload className="w-4 h-4 mr-2 text-slate-500" />
                                Select Photo
                            </label>
                            <Input
                                id="photoUpload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onPhotoFileSelected(e.target.files?.[0] || null)}
                            />
                            {form.photoUrl ? (
                                <p className="text-xs text-emerald-600 font-medium">Photo ready for card.</p>
                            ) : (
                                <p className="text-xs text-slate-500">If no photo is selected, initials will appear on card.</p>
                            )}
                        </div>

                        <div className="pt-1 text-xs text-slate-500 flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5" />
                            QR code is generated automatically from Member ID.
                        </div>

                        {savedMemberRecordId ? (
                            <p className="text-xs font-medium text-emerald-700">Member entry saved in foundation records.</p>
                        ) : (
                            <p className="text-xs text-amber-700">Save member entry first to auto-generate Member ID.</p>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-3">
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
                                fullName={form.fullName}
                                memberId={form.memberId}
                                email={form.email}
                                address={fullAddress}
                                phone={form.phone || "-"}
                                photoUrl={form.photoUrl}
                                qrCodeData={qrCodeData}
                                adminSignature={adminSignature}
                            />
                            <BackCard joinDate={form.joinDate} expiryDate={form.expiryDate} />
                        </div>
                    </div>

                    <div style={{ width: previewW }} className="flex mx-auto">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center" style={{ width: Math.round(CARD_W * scale) }}>Front</p>
                        <p
                            className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center"
                            style={{ width: Math.round(CARD_W * scale), marginLeft: Math.round(GAP * scale) }}
                        >
                            Back
                        </p>
                    </div>

                    <p className="text-xs text-slate-500 text-center">Card number: {cardNumber}</p>

                    {loadingSignature ? (
                        <p className="text-xs text-slate-400 text-center">Loading admin signature...</p>
                    ) : !adminSignature ? (
                        <p className="text-xs text-amber-700 text-center">Admin signature is not set in site settings. Card will be generated without signature.</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function FrontCard({
    fullName,
    memberId,
    email,
    address,
    phone,
    photoUrl,
    qrCodeData,
    adminSignature,
}: {
    fullName: string;
    memberId: string;
    email: string;
    address: string;
    phone: string;
    photoUrl: string;
    qrCodeData: string | null;
    adminSignature: string;
}) {
    return (
        <div
            style={{
                width: CARD_W,
                height: CARD_H,
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
                fontFamily: "Arial, Helvetica, sans-serif",
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/images/id-card-front-bg.png"
                alt=""
                crossOrigin="anonymous"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    top: 280,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: 26,
                }}
            >
                <div
                    style={{
                        width: 160,
                        height: 190,
                        borderRadius: 13,
                        overflow: "hidden",
                        border: "4px solid #fff",
                        boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
                        background: "#f2dece",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <span style={{ fontSize: 46, fontWeight: 800, color: "#7c2d12" }}>
                            {getInitials(fullName || "Member")}
                        </span>
                    )}
                </div>

                <div
                    style={{
                        width: 150,
                        height: 150,
                        borderRadius: 13,
                        background: "#fff",
                        border: "3px solid #ddc9b4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        padding: 5,
                        boxShadow: "0 4px 18px rgba(0,0,0,0.10)",
                    }}
                >
                    {qrCodeData ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qrCodeData} alt="QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                        <span style={{ fontSize: 10, color: "#aaa" }}>QR N/A</span>
                    )}
                </div>
            </div>

            {[
                { top: 525, value: fullName || "-", fs: 26, fw: 700, mono: false, ml: false },
                { top: 588, value: memberId || "-", fs: 24, fw: 700, mono: true, ml: false },
                { top: 653, value: email || "-", fs: 22, fw: 600, mono: false, ml: false },
                { top: 715, value: address || "-", fs: 22, fw: 600, mono: false, ml: true },
                { top: 783, value: phone || "-", fs: 24, fw: 700, mono: false, ml: false },
            ].map(({ top, value, fs, fw, mono, ml }) => (
                <div key={top} style={{ position: "absolute", top, left: 182, right: 22, overflow: "hidden" }}>
                    <span
                        style={{
                            fontSize: fs,
                            fontWeight: fw,
                            color: "#2c1008",
                            fontFamily: mono ? "monospace" : "Arial, Helvetica, sans-serif",
                            lineHeight: ml ? 1.25 : 1,
                            display: "block",
                            whiteSpace: ml ? "normal" : "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {value}
                    </span>
                </div>
            ))}

            {adminSignature && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 150,
                        right: 34,
                        width: 162,
                        height: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={adminSignature}
                        alt="signature"
                        crossOrigin="anonymous"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                </div>
            )}
        </div>
    );
}

function BackCard({ joinDate, expiryDate }: { joinDate: string; expiryDate: string }) {
    const join = joinDate ? formatDate(new Date(joinDate)) : "-";
    const expiry = expiryDate ? formatDate(new Date(expiryDate)) : "-";

    return (
        <div
            style={{
                width: CARD_W,
                height: CARD_H,
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
                fontFamily: "Arial, Helvetica, sans-serif",
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/images/id-card-back-bg.png"
                alt=""
                crossOrigin="anonymous"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                }}
            />
            <div style={{ position: "absolute", top: 542, left: 268 }}>
                <span
                    style={{
                        fontSize: 21,
                        fontWeight: 700,
                        color: "#2c1008",
                        whiteSpace: "nowrap",
                        fontFamily: "Arial, Helvetica, sans-serif",
                    }}
                >
                    {join}
                </span>
            </div>
            <div style={{ position: "absolute", top: 591, left: 268 }}>
                <span
                    style={{
                        fontSize: 21,
                        fontWeight: 700,
                        color: "#2c1008",
                        whiteSpace: "nowrap",
                        fontFamily: "Arial, Helvetica, sans-serif",
                    }}
                >
                    {expiry}
                </span>
            </div>
        </div>
    );
}
