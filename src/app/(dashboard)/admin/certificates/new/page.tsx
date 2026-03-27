"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { certificateSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Award, Save, Target, User, Search } from "lucide-react";
import { CERTIFICATE_LABELS } from "@/lib/constants";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const RichTextEditor = dynamic(() => import("@/components/dashboard/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-amber-900/10 rounded-2xl bg-white/50 backdrop-blur-sm min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-amber-900/40">
        <Loader2 className="w-8 h-8 animate-spin" strokeWidth={1.5} />
        <span className="text-sm font-medium tracking-wide">Loading canvas...</span>
      </div>
    </div>
  ),
});

type CertificateFormData = z.input<typeof certificateSchema>;

const TEMPLATES: Record<string, string> = {
    MEMBERSHIP: `<h3>Certificate of Membership</h3><p>This is to certify that the individual has been officially inducted as a member of Nirashray Foundation. We deeply appreciate their commitment to our mission and their ongoing support for our social initiatives.</p>`,
    APPRECIATION: `<h3>Certificate of Appreciation</h3><p>This certificate is proudly presented in recognition of outstanding dedication, passion, and exceptional contributions toward the betterment of society through the initiatives of Nirashray Foundation.</p>`,
    VOLUNTEER: `<h3>Certificate of Volunteering</h3><p>This acknowledges the selfless service and invaluable time dedicated as a volunteer. Your efforts have created a lasting impact in the communities we serve.</p>`,
    DONATION: `<h3>Certificate of Philanthropy</h3><p>Presented in profound gratitude for the generous financial support provided to Nirashray Foundation. Your contribution empowers us to continue our mission of bringing hope and change.</p>`,
    ACHIEVEMENT: `<h3>Certificate of Achievement</h3><p>Awarded for exceptional performance, leadership, and successful execution of key responsibilities that have significantly advanced the goals of our organization.</p>`
};

export default function NewCertificatePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [members, setMembers] = useState<{ id: string, name: string, email: string }[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<CertificateFormData>({
        resolver: zodResolver(certificateSchema) as any,
        defaultValues: { 
            memberId: "", 
            type: "APPRECIATION", 
            title: "Certificate of Appreciation", 
            description: TEMPLATES.APPRECIATION, 
            issuedBy: "" 
        },
    });

    const type = watch("type");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch("/api/members?pageSize=500");
                const data = await res.json();
                if (data.success) {
                    setMembers(data.data.members.map((m: any) => ({
                        id: m.id,
                        name: m.user.name || "Unknown",
                        email: m.user.email,
                    })));
                }
            } catch (err) {
                console.error("Failed to load members", err);
            } finally {
                setLoadingMembers(false);
            }
        };
        fetchMembers();
    }, []);

    useEffect(() => {
        if (session?.user?.name) {
            setValue("issuedBy", session.user.name);
        }
    }, [session, setValue]);

    const handleTypeChange = (newType: string) => {
        setValue("type", newType as any);
        const defaultTitle = CERTIFICATE_LABELS[newType as keyof typeof CERTIFICATE_LABELS] || "Certificate";
        setValue("title", defaultTitle);
        setValue("description", TEMPLATES[newType] || "");
    };

    const onSubmit = async (data: CertificateFormData) => {
        setSaving(true);
        try {
            const res = await fetch("/api/certificates", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Certificate issued successfully! 🎉");
                router.push("/admin/certificates");
            } else {
                toast.error(result.error || "Failed to issue certificate.");
            }
        } catch {
            toast.error("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfcfa] relative overflow-hidden">
            {/* Editorial Canvas Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-amber-300/10 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-amber-900/10 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/certificates")}
                            className="text-emerald-800/60 hover:text-emerald-900 hover:bg-emerald-100/50 flex-shrink-0 -ml-2 rounded-xl transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                        </Button>
                        <div className="w-px h-6 bg-emerald-900/10 flex-shrink-0" />
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2} />
                            <span className="text-[15px] font-bold text-slate-800 tracking-tight truncate font-serif">
                                Issue New Certificate
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={saving}
                            className="h-9 px-5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md shadow-emerald-900/10 transition-all font-semibold tracking-wide">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Generate Certificate</>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main layout */}
            <div className="max-w-screen-2xl mx-auto px-6 py-10 relative z-10">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col xl:flex-row gap-10">
                    
                    {/* Left Column - Certificate Design/Content */}
                    <div className="flex-1 min-w-0 space-y-8">
                        <div className="group relative">
                            <input
                                {...register("title")}
                                placeholder="Certificate Title..."
                                className="w-full text-4xl md:text-5xl font-bold text-slate-900 placeholder:text-slate-300
                                bg-transparent border-none outline-none resize-none leading-tight tracking-tight
                                font-serif py-2 transition-all focus:placeholder:opacity-50 text-center"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 inline-block px-2 py-1 rounded-md text-center w-full">{errors.title.message}</p>}
                        </div>

                        {/* Editor Canvas */}
                        <div className="relative mt-8">
                            <div className="absolute -inset-1 rounded-[1.5rem] bg-gradient-to-b from-emerald-100/50 to-transparent -z-10 blur-xl opacity-50" />
                            <div className="bg-white/90 backdrop-blur-md border border-emerald-900/10 shadow-xl shadow-emerald-900/5 rounded-2xl overflow-hidden group hover:border-emerald-900/20 transition-colors p-2">
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <RichTextEditor
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            placeholder="Write the certificate citation here..."
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column / Sidebar */}
                    <div className="w-full xl:w-[400px] flex-shrink-0 space-y-6">
                        
                        {/* Certificate Configuration */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-900/10 transition-shadow duration-500">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-300 to-emerald-500 opacity-80" />
                            <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <Target className="w-5 h-5 text-emerald-600" /> Options
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Type/Template Selection */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Award className="w-3 h-3" /> Certificate Template *</Label>
                                    <Select value={type} onValueChange={handleTypeChange}>
                                        <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-emerald-200 focus:border-emerald-400">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(CERTIFICATE_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-slate-400 italic mt-1">Changing the template will reset the citation below.</p>
                                </div>

                                {/* Member Selection */}
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> Recipient *</Label>
                                    <Controller
                                        name="memberId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={loadingMembers}>
                                                <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-emerald-200 focus:border-emerald-400">
                                                    <SelectValue placeholder={loadingMembers ? "Loading..." : "Select Member"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {members.map(m => (
                                                            <SelectItem key={m.id} value={m.id}>
                                                                {m.name} <span className="text-slate-400 text-xs ml-1">({m.email})</span>
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.memberId && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{errors.memberId.message}</p>}
                                </div>
                                
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Save className="w-3 h-3" /> Issued By *</Label>
                                    <Input {...register("issuedBy")} className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-emerald-200 focus:border-emerald-400" placeholder="e.g. John Doe, President" />
                                    {errors.issuedBy && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{errors.issuedBy.message}</p>}
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
