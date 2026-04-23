"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Save, Globe, FileText,
  ImageIcon as ImageIconLine, Clock, Calendar, MapPin, Search
} from "lucide-react";
import { generateSlug } from "@/lib/utils";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CloudinaryUploadButton } from "@/components/ui/cloudinary-upload-button";

// Lazy-load editor (client-only)
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

type EventFormData = z.input<typeof eventSchema>;

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } =
    useForm<EventFormData>({
      resolver: zodResolver(eventSchema) as any,
      defaultValues: {
        title: "",
        slug: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        image: "",
        isPublished: false,
      },
    });

  const title = watch("title");
  const isPublished = watch("isPublished");
  const image = watch("image");

  // Auto-generate slug from title
  useEffect(() => {
    if (title) setValue("slug", generateSlug(title));
  }, [title, setValue]);

  const onSubmit = async (data: EventFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Event created successfully! 🎉");
        router.push("/admin/events");
      } else {
        toast.error(result.error || "Failed to save event.");
      }
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = handleSubmit(async (data) => {
    setValue("isPublished", false);
    await onSubmit({ ...data, isPublished: false });
  });

  const publish = handleSubmit(async (data) => {
    setValue("isPublished", true);
    await onSubmit({ ...data, isPublished: true });
  });

  return (
    <div className="min-h-screen bg-[#fdfcfa] relative overflow-hidden">
      {/* Editorial Canvas Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-amber-900/10 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: back + title */}
          <div className="flex items-center gap-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/events")}
              className="text-amber-800/60 hover:text-amber-900 hover:bg-amber-100/50 flex-shrink-0 -ml-2 rounded-xl transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <div className="w-px h-6 bg-amber-900/10 flex-shrink-0" />
            <div className="flex items-center gap-2.5 min-w-0">
              <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={2} />
              <span className="text-[15px] font-bold text-slate-800 tracking-tight truncate font-serif">
                {title || "Crafting New Event"}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Status badge */}
            <Badge className={`hidden sm:flex text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 border shadow-sm ${isPublished ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {isPublished ? <><Globe className="w-3 h-3 mr-1.5" />Published</> : <><FileText className="w-3 h-3 mr-1.5" />Draft</>}
            </Badge>

            <Button variant="outline" size="sm" onClick={saveDraft} disabled={saving}
              className="h-9 px-4 text-xs border-amber-900/20 text-slate-600 hover:text-amber-900 hover:bg-amber-50 rounded-xl transition-all font-semibold">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1.5" />Save Draft</>}
            </Button>

            <Button size="sm" onClick={publish} disabled={saving}
              className="h-9 px-5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-md shadow-amber-900/10 transition-all font-semibold tracking-wide">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <><Globe className="w-3.5 h-3.5 mr-1.5" />Publish</>}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-6 py-10 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col xl:flex-row gap-10">

          {/* ── Editor column ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Title */}
            <div className="group relative">
              <div className="absolute -inset-x-4 -inset-y-2 rounded-2xl bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              <input
                {...register("title")}
                placeholder="Give this event a compelling title..."
                className="w-full text-4xl md:text-5xl font-bold text-slate-900 placeholder:text-slate-300
                  bg-transparent border-none outline-none resize-none leading-tight tracking-tight
                  font-serif py-2 transition-all focus:placeholder:opacity-50"
              />
              {errors.title && <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 inline-block px-2 py-1 rounded-md">{errors.title.message}</p>}
            </div>

            {/* Editor Canvas */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-[1.5rem] bg-gradient-to-b from-amber-100/50 to-transparent -z-10 blur-xl opacity-50" />
              <div className="bg-white/80 backdrop-blur-md border border-amber-900/10 shadow-xl shadow-amber-900/5 rounded-2xl overflow-hidden group hover:border-amber-900/20 transition-colors">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Describe the event details, itinerary, and what attendees can expect..."
                    />
                  )}
                />
              </div>
              {errors.description && <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 inline-block px-2 py-1 rounded-md">{errors.description.message}</p>}
            </div>

          </div>

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <div className="w-full xl:w-[380px] flex-shrink-0 space-y-6">

            {/* Event Logistics */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-shadow duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-amber-500 opacity-80" />
              <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-amber-600" /> Event Logistics
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date *</Label>
                    <Input {...register("date")} type="date" className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" />
                    {errors.date && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{errors.date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time *</Label>
                    <Input {...register("time")} placeholder="10:00 AM" className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" />
                    {errors.time && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{errors.time.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Venue *</Label>
                  <Input {...register("venue")} placeholder="Exact location or platform" className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" />
                  {errors.venue && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider">{errors.venue.message}</p>}
                </div>
              </div>
            </div>

            {/* Media & URL */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/40 p-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-shadow duration-500">
              <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <ImageIconLine className="w-5 h-5 text-amber-600" /> Identity & Media
              </h3>
              
              <div className="space-y-6">
                {/* Image */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cover Image</Label>
                  {image ? (
                    <div className="relative rounded-xl overflow-hidden border-4 border-white shadow-lg bg-slate-100 group/image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Featured" className="w-full h-40 object-cover group-hover/image:scale-105 transition-transform duration-700" />
                      <button
                        type="button"
                        onClick={() => setValue("image", "")}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity text-white text-[10px] uppercase tracking-widest font-bold backdrop-blur-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-amber-900/20 bg-amber-50/50 rounded-xl h-32 flex flex-col items-center justify-center text-amber-900/40 gap-2 transition-colors hover:border-amber-400 hover:bg-amber-50">
                      <ImageIconLine className="w-6 h-6" strokeWidth={1.5} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">No Cover Set</span>
                    </div>
                  )}
                  <Input {...register("image")} className="h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:ring-amber-200 focus:border-amber-400" placeholder="Paste image URL here..." />
                  <CloudinaryUploadButton
                    buttonText="Upload Cover Image"
                    className="w-full"
                    disabled={saving}
                    onUploaded={(url) => {
                      setValue("image", url, { shouldDirty: true });
                      toast.success("Cover image uploaded successfully.");
                    }}
                    onError={() => {
                      toast.error("Failed to upload cover image.");
                    }}
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Search className="w-3 h-3" /> Custom URL</Label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-200 focus-within:border-amber-400 transition-all">
                    <span className="flex items-center px-3 text-[11px] text-slate-400 bg-slate-100 border-r border-slate-200 font-mono">/events/</span>
                    <input {...register("slug")} className="h-10 text-sm flex-1 bg-transparent px-3 outline-none text-slate-700 placeholder:text-slate-300 font-medium" placeholder="custom-url-slug" />
                  </div>
                  {errors.slug && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider pt-1">{errors.slug.message}</p>}
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
