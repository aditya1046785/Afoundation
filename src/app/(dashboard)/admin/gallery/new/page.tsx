"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, ImageIcon, Images, FolderPlus, UploadCloud, CheckCircle2, FileText } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { CloudinaryUploadButton } from "@/components/ui/cloudinary-upload-button";

const uploadSchema = z.object({
    mode: z.enum(["select", "create"]),
    albumId: z.string().optional(),
    newAlbumTitle: z.string().optional(),
    imageUrl: z.string().url("Please enter a valid Image URL").min(1, "Image URL is required"),
    caption: z.string().optional(),
}).refine(data => {
    if (data.mode === "select" && !data.albumId) return false;
    if (data.mode === "create" && (!data.newAlbumTitle || data.newAlbumTitle.length < 3)) return false;
    return true;
}, { message: "Please select an existing album or provide a valid new album title.", path: ["newAlbumTitle"] });

type UploadFormData = z.infer<typeof uploadSchema>;

export default function GalleryUploadPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [albums, setAlbums] = useState<{ id: string, title: string }[]>([]);
    const [loadingAlbums, setLoadingAlbums] = useState(true);

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
        defaultValues: { 
            mode: "select",
            albumId: "",
            newAlbumTitle: "",
            imageUrl: "",
            caption: ""
        },
    });

    const mode = watch("mode");
    const imageUrl = watch("imageUrl");

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const res = await fetch("/api/gallery/albums?admin=true");
                const data = await res.json();
                if (data.success) {
                    setAlbums(data.data.map((a: any) => ({ id: a.id, title: a.title })));
                    if (data.data.length > 0) {
                        setValue("albumId", data.data[0].id);
                    } else {
                        setValue("mode", "create");
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingAlbums(false);
            }
        };
        fetchAlbums();
    }, [setValue]);

    const onSubmit = async (data: UploadFormData) => {
        setSaving(true);
        try {
            let finalAlbumId = data.albumId;

            // 1. If mode is "create", we must first create the new album
            if (data.mode === "create" && data.newAlbumTitle) {
                const albumRes = await fetch("/api/gallery/albums", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: data.newAlbumTitle,
                        slug: generateSlug(data.newAlbumTitle),
                        coverImage: data.imageUrl, // Set the first image as cover
                        isFeatured: false,
                        isVisible: true
                    }),
                });
                const albumData = await albumRes.json();
                if (!albumData.success) {
                    toast.error(albumData.error || "Failed to create the new album.");
                    setSaving(false);
                    return;
                }
                finalAlbumId = albumData.data.id;
            }

            // 2. Upload the Photo to the album
            if (!finalAlbumId) {
                toast.error("No valid album selected.");
                setSaving(false);
                return;
            }

            const photoRes = await fetch("/api/gallery/photos", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    albumId: finalAlbumId,
                    imageUrl: data.imageUrl,
                    caption: data.caption,
                    displayOrder: 0
                }),
            });
            const photoData = await photoRes.json();

            if (photoData.success) {
                toast.success("Image uploaded successfully! 🎉");
                router.push("/admin/gallery");
            } else {
                toast.error(photoData.error || "Failed to upload image.");
            }
        } catch {
            toast.error("An error occurred while uploading.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfcfa] relative overflow-hidden">
            {/* Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-amber-300/10 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-blue-900/10 shadow-sm">
                <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/gallery")}
                            className="text-blue-800/60 hover:text-blue-900 hover:bg-blue-100/50 flex-shrink-0 -ml-2 rounded-xl transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                        </Button>
                        <div className="w-px h-6 bg-blue-900/10 flex-shrink-0" />
                        <div className="flex items-center gap-2.5 min-w-0">
                            <UploadCloud className="w-4 h-4 text-blue-600 flex-shrink-0" strokeWidth={2} />
                            <span className="text-[15px] font-bold text-slate-800 tracking-tight truncate font-serif">
                                Upload Photo to Gallery
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={saving}
                            className="h-9 px-5 text-xs bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-md shadow-blue-900/10 transition-all font-semibold tracking-wide">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Upload Photo</>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main form layout */}
            <div className="max-w-screen-xl mx-auto px-6 py-10 relative z-10 flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-[480px] flex-shrink-0 space-y-6">
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/50 p-6 md:p-8">
                        <h2 className="font-serif text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Images className="w-6 h-6 text-blue-600" /> Photo Details
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Category Selection */}
                            <div className="space-y-4 bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <FolderPlus className="w-3.5 h-3.5" /> Choose Category (Album)
                                </Label>
                                
                                <Controller
                                    name="mode"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4 mb-4">
                                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 cursor-pointer">
                                                <RadioGroupItem value="select" id="r-select" />
                                                <Label htmlFor="r-select" className="text-sm cursor-pointer font-medium">Existing</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 cursor-pointer">
                                                <RadioGroupItem value="create" id="r-create" />
                                                <Label htmlFor="r-create" className="text-sm cursor-pointer font-medium">Create New</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />

                                {mode === "select" ? (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                        <Controller
                                            name="albumId"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange} disabled={loadingAlbums}>
                                                    <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm rounded-xl">
                                                        <SelectValue placeholder={loadingAlbums ? "Loading categories..." : "Select a category"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {albums.length === 0 && <SelectItem value="none" disabled>No categories available</SelectItem>}
                                                        {albums.map((a) => (
                                                            <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                        <Input {...register("newAlbumTitle")} placeholder="e.g. Education Drive 2024" className="h-11 bg-white border-slate-200 shadow-sm rounded-xl font-medium" />
                                        {errors.newAlbumTitle && <p className="text-red-500 text-xs font-semibold">{errors.newAlbumTitle.message}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Image URL */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Image URL *</Label>
                                <Input {...register("imageUrl")} placeholder="https://..." className="h-11 bg-slate-50 border-slate-200 shadow-sm rounded-xl" />
                                <CloudinaryUploadButton
                                    buttonText="Upload Photo"
                                    className="w-full"
                                    disabled={saving}
                                    onUploaded={(url) => {
                                        setValue("imageUrl", url, { shouldValidate: true, shouldDirty: true });
                                        toast.success("Photo uploaded successfully.");
                                    }}
                                    onError={() => {
                                        toast.error("Failed to upload photo.");
                                    }}
                                />
                                {errors.imageUrl && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{errors.imageUrl.message}</p>}
                            </div>

                            {/* Caption */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FileText className="w-3 h-3" /> Heading / Caption</Label>
                                <Textarea {...register("caption")} placeholder="Add a descriptive heading for this photo..." className="bg-slate-50 border-slate-200 shadow-sm rounded-xl min-h-[100px] resize-none" />
                            </div>
                        </form>
                    </div>
                </div>

                {/* Preview Window */}
                <div className="flex-1">
                    <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white p-6 shadow-inner h-full min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        
                        {imageUrl ? (
                            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x600?text=Invalid+Image+URL"; }} />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-left opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                    <h3 className="text-white font-serif text-xl font-bold line-clamp-2">{watch("caption") || "No caption added"}</h3>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                                        Adding to: {mode === 'select' ? (albums.find(a => a.id === watch("albumId"))?.title || 'Unknown') : (watch("newAlbumTitle") || 'New Category')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                <div className="w-24 h-24 rounded-full bg-slate-100/80 border-2 border-dashed border-slate-200 flex items-center justify-center mb-2 shadow-inner">
                                    <ImageIcon className="w-10 h-10 text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl font-bold text-slate-700">Image Preview</h3>
                                    <p className="text-sm font-medium opacity-70 mt-1 max-w-xs mx-auto">Paste a generic Image URL on the left to see your photo preview here.</p>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
