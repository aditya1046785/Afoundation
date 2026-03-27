"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, ImageIcon as ImageIconLine, Target, UploadCloud } from "lucide-react";

export default function NewCampaignPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "", description: "", target: "", raised: "0", image: "", category: "", isActive: true
    });

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Get signature from API
            const sigRes = await fetch("/api/upload");
            const sigData = await sigRes.json();
            if (!sigData.success) throw new Error("Could not fetch upload signature");

            const { signature, timestamp, cloudName, apiKey, folder } = sigData.data;

            // Upload directly to Cloudinary
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("signature", signature);
            uploadFormData.append("timestamp", String(timestamp));
            uploadFormData.append("api_key", apiKey);
            uploadFormData.append("folder", folder);

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: uploadFormData
            });

            const uploadedFile = await uploadRes.json();
            if (uploadedFile.secure_url) {
                setFormData(prev => ({ ...prev, image: uploadedFile.secure_url }));
                toast.success("Image uploaded!");
            } else {
                toast.error("Cloudinary upload failed.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/crowdfunding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Campaign created successfully! 🎉");
                router.push("/admin/crowdfunding");
            } else {
                toast.error(result.error || "Failed to create campaign.");
            }
        } catch (err) {
            toast.error("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfcfa] relative overflow-hidden">
            {/* Background embellishments */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-amber-900/10 shadow-sm">
                <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/crowdfunding")}
                            className="text-amber-800/60 hover:text-amber-900 hover:bg-amber-100/50 flex-shrink-0 -ml-2 rounded-xl transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                        </Button>
                        <div className="w-px h-6 bg-amber-900/10 flex-shrink-0" />
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Target className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={2} />
                            <span className="text-[15px] font-bold text-slate-800 tracking-tight truncate font-serif">
                                Crafting New Campaign
                            </span>
                        </div>
                    </div>

                    <Button size="sm" onClick={onSubmit} disabled={saving}
                        className="h-9 px-5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-md transition-all font-semibold tracking-wide">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Save Campaign</>}
                    </Button>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-6 py-10 relative z-10">
                <form onSubmit={onSubmit} className="flex flex-col lg:flex-row gap-10">
                    {/* Main content */}
                    <div className="flex-1 space-y-8">
                        {/* Title */}
                        <div className="group relative">
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Give this campaign a compelling title..."
                                className="w-full text-4xl md:text-5xl font-bold text-slate-900 placeholder:text-slate-300
                                  bg-transparent border-none outline-none resize-none leading-tight tracking-tight
                                  font-serif py-2 transition-all focus:placeholder:opacity-50"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Story & Details</Label>
                            <Textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Write a brief, touching description of why this campaign exists and its goals..."
                                className="min-h-[200px] text-base resize-y bg-white/80 backdrop-blur-md border border-amber-900/10 shadow-sm rounded-2xl focus:ring-amber-200 focus:border-amber-400 text-slate-700 p-5"
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-[380px] flex-shrink-0 space-y-6">
                        {/* Financial goals */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-6 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-amber-500 opacity-80" />
                            <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <Target className="w-5 h-5 text-amber-600" /> Funding Goals
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Amount (₹)</Label>
                                    <Input required type="number" value={formData.target} min="1" onChange={e => setFormData({ ...formData, target: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200" placeholder="e.g. 500000" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Raised (₹)</Label>
                                    <Input required type="number" value={formData.raised} min="0" onChange={e => setFormData({ ...formData, raised: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</Label>
                                    <Input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200" placeholder="e.g. Healthcare, Education" />
                                </div>
                            </div>
                        </div>

                        {/* Media */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-6">
                            <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <ImageIconLine className="w-5 h-5 text-amber-600" /> Cover Image
                            </h3>
                            <div className="space-y-4">
                                {formData.image ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-100 group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={formData.image} alt="Preview" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: "" })}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] uppercase font-bold backdrop-blur-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50 cursor-pointer rounded-xl h-32 flex flex-col items-center justify-center text-slate-400 hover:text-amber-600 transition-colors"
                                    >
                                        {uploading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.5} />
                                        ) : (
                                            <>
                                                <UploadCloud className="w-6 h-6 mb-2" strokeWidth={1.5} />
                                                <span className="text-[10px] uppercase font-bold text-center px-4">Click to upload from System</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleUploadImage} 
                                            accept="image/*" 
                                            className="hidden" 
                                        />
                                    </div>
                                )}
                                
                                <div className="text-center text-xs text-slate-400 font-medium my-2 uppercase">— OR —</div>
                                
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image URL</Label>
                                    <Input required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl text-sm" placeholder="Paste link here..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
