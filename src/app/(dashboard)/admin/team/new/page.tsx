"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamMemberSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Users, ImageIcon as ImageIconLine, Link as LinkIcon, Info } from "lucide-react";
import { TEAM_CATEGORIES } from "@/lib/constants";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";

type TeamFormData = z.input<typeof teamMemberSchema>;

export default function NewTeamMemberPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<TeamFormData>({
        resolver: zodResolver(teamMemberSchema) as any,
        defaultValues: { 
            name: "", 
            role: "", 
            category: "Core Team", 
            photo: "", 
            bio: "", 
            displayOrder: 0,
            instagramUrl: "",
            facebookUrl: "",
            linkedinUrl: "",
            twitterUrl: ""
        },
    });

    const category = watch("category");
    const photo = watch("photo");

    const onSubmit = async (data: TeamFormData) => {
        setSaving(true);
        try {
            const res = await fetch("/api/team", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Team member added successfully! 🎉");
                router.push("/admin/team");
            } else {
                toast.error(result.error || "Failed to add team member.");
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
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-amber-900/10 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/team")}
                            className="text-amber-800/60 hover:text-amber-900 hover:bg-amber-100/50 flex-shrink-0 -ml-2 rounded-xl transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                        </Button>
                        <div className="w-px h-6 bg-amber-900/10 flex-shrink-0" />
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Users className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={2} />
                            <span className="text-[15px] font-bold text-slate-800 tracking-tight truncate font-serif">
                                Add Team Member
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge className="hidden sm:flex text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 border shadow-sm bg-amber-50 text-amber-700 border-amber-200">
                            {category}
                        </Badge>
                        <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={saving}
                            className="h-9 px-5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-md shadow-amber-900/10 transition-all font-semibold tracking-wide">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Save Member</>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main layout */}
            <div className="max-w-screen-2xl mx-auto px-6 py-10 relative z-10">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col xl:flex-row gap-10">
                    
                    {/* Left Column */}
                    <div className="flex-1 min-w-0 space-y-8">
                        {/* Name and Role */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-shadow duration-500">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-300 to-amber-500 opacity-80" />
                            
                            <div className="mb-6">
                                <h3 className="font-serif text-xl font-bold text-slate-800">Basic Information</h3>
                                <p className="text-sm text-slate-500 font-medium">The primary details for this member.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name *</Label>
                                    <Input {...register("name")} className="h-12 text-lg bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400 font-serif font-bold placeholder:font-sans placeholder:font-normal placeholder:text-base text-slate-900" placeholder="e.g. Jane Doe" />
                                    {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{errors.name.message}</p>}
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role / Designation *</Label>
                                        <Input {...register("role")} className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" placeholder="e.g. Founder & President" />
                                        {errors.role && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{errors.role.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</Label>
                                        <Controller
                                            name="category"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {TEAM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio / Description */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-shadow duration-500">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-slate-800 flex items-center gap-2"><Info className="w-5 h-5 text-amber-600" /> Biography</h3>
                                    <p className="text-sm text-slate-500 font-medium">A short description about this member.</p>
                                </div>
                            </div>
                            
                            <Textarea 
                                {...register("bio")} 
                                className="min-h-[160px] text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400 leading-relaxed resize-y" 
                                placeholder="Write a brief background about this team member..." 
                            />
                        </div>
                    </div>

                    {/* Right Column / Sidebar */}
                    <div className="w-full xl:w-[400px] flex-shrink-0 space-y-6">
                        
                        {/* Profile Photo */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-shadow duration-500">
                            <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <ImageIconLine className="w-5 h-5 text-amber-600" /> Member Portrait
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl shadow-amber-900/10 overflow-hidden bg-amber-50 relative">
                                            {photo ? (
                                                <Image src={photo} alt="Preview" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-amber-700/30 gap-1 bg-amber-50">
                                                    <Users className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="w-full space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Image URL</Label>
                                        <Input {...register("photo")} className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400 w-full" placeholder="https://..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-shadow duration-500">
                            <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <LinkIcon className="w-5 h-5 text-amber-600" /> Social Links
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">LinkedIn</Label>
                                    <Input {...register("linkedinUrl")} className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" placeholder="https://linkedin.com/in/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Twitter (X)</Label>
                                    <Input {...register("twitterUrl")} className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" placeholder="https://twitter.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Instagram</Label>
                                    <Input {...register("instagramUrl")} className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" placeholder="https://instagram.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Facebook</Label>
                                    <Input {...register("facebookUrl")} className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" placeholder="https://facebook.com/..." />
                                </div>
                            </div>
                        </div>

                        {/* Display Settings */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-shadow duration-500">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Display Order Target</Label>
                                <div className="flex gap-2">
                                    <Input {...register("displayOrder", { valueAsNumber: true })} type="number" className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400 w-24 text-center font-bold" />
                                    <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-2.5 flex items-center justify-center">
                                        <p className="text-[10px] text-amber-700 uppercase font-bold tracking-widest text-center leading-tight">Lower numbers appear first</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
