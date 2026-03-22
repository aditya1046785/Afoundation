"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogPostSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Save, Eye, EyeOff, Globe, FileText,
  Tag, FolderOpen, Image as ImageIcon, BookOpen, CheckCircle2,
  Clock, BarChart3,
} from "lucide-react";
import { generateSlug } from "@/lib/utils";
import type { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/dashboard/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-slate-200 rounded-xl bg-white min-h-[560px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm">Loading editor…</span>
      </div>
    </div>
  ),
});

type BlogFormData = z.input<typeof blogPostSchema>;

const CATEGORIES = [
  "Impact Stories", "Field Updates", "Announcements", "Events",
  "Volunteer Stories", "Donor Spotlight", "Health & Welfare",
  "Education", "Community", "Policy & Advocacy",
];

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { register, handleSubmit, setValue, watch, control, reset, formState: { errors } } =
    useForm<BlogFormData>({
      resolver: zodResolver(blogPostSchema) as any,
      defaultValues: {
        status: "DRAFT", title: "", slug: "", excerpt: "",
        content: "", featuredImage: "", category: "", tags: "",
      },
    });

  const title = watch("title");
  const content = watch("content");
  const status = watch("status");
  const featuredImage = watch("featuredImage");

  // Load existing post
  useEffect(() => {
    if (!postId) return;
    (async () => {
      const res = await fetch(`/api/blog/${postId}`);
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        reset({
          title: p.title || "",
          slug: p.slug || "",
          excerpt: p.excerpt || "",
          content: p.content || "",
          featuredImage: p.featuredImage || "",
          category: p.category || "",
          tags: p.tags || "",
          status: p.status || "DRAFT",
        });
      } else {
        toast.error("Post not found");
        router.push("/admin/blog");
      }
      setLoading(false);
    })();
  }, [postId, reset, router]);

  // Auto-slug from title (only if slug hasn't been manually changed)
  // Don't auto-update slug on edit to avoid breaking existing URLs
  // useEffect(() => { if (title) setValue("slug", generateSlug(title)); }, [title, setValue]);

  useEffect(() => {
    const text = content?.replace(/<[^>]*>/g, "") || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [content]);

  const onSubmit = async (data: BlogFormData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Post updated! ✅");
        setLastSaved(new Date());
      } else {
        toast.error(result.error || "Failed to update post.");
      }
    } finally {
      setSaving(false);
    }
  };

  const saveAndBack = handleSubmit(async (data) => {
    await onSubmit(data);
    router.push("/admin/blog");
  });

  const readingTime = Math.ceil(wordCount / 200);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm">Loading post…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/blog")}
              className="text-slate-500 hover:text-slate-800 flex-shrink-0 -ml-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-800 truncate">{title || "Editing Post"}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{wordCount} words</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readingTime} min read</span>
            {lastSaved && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={`hidden sm:flex text-xs border ${status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
              {status === "PUBLISHED" ? <><Globe className="w-3 h-3 mr-1" />Published</> : <><FileText className="w-3 h-3 mr-1" />Draft</>}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(p => !p)}
              className="text-slate-600 border-slate-200 h-8 px-3 text-xs">
              {previewMode ? <><EyeOff className="w-3.5 h-3.5 mr-1" />Edit</> : <><Eye className="w-3.5 h-3.5 mr-1" />Preview</>}
            </Button>
            <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={saving}
              className="h-8 px-3 text-xs border-slate-200 bg-white border hover:bg-slate-50 text-slate-700">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" />Save</>}
            </Button>
            <Button size="sm" onClick={saveAndBack} disabled={saving}
              className="h-8 px-4 text-xs bg-blue-700 hover:bg-blue-800 text-white">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Save & Done
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <input
                {...register("title")}
                placeholder="Your Blog Post Title…"
                className="w-full text-3xl font-bold text-slate-900 placeholder:text-slate-300
                  bg-transparent border-none outline-none resize-none leading-tight font-serif py-2"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <textarea
                {...register("excerpt")}
                placeholder="Write a short excerpt or summary…"
                rows={2}
                className="w-full text-base text-slate-500 placeholder:text-slate-300
                  bg-transparent border-none outline-none resize-none leading-relaxed
                  border-b border-dashed border-slate-200 pb-3"
              />
              {errors.excerpt && <p className="text-red-500 text-xs">{errors.excerpt.message}</p>}
            </div>

            {previewMode ? (
              <div className="border border-slate-200 rounded-xl bg-white px-8 py-6 min-h-[560px]">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h1 className="text-3xl font-bold text-slate-900 font-serif mb-2">{title || "Untitled Post"}</h1>
                  {watch("excerpt") && <p className="text-slate-500 text-base italic">{watch("excerpt")}</p>}
                </div>
                {content ? (
                  <div className="editor-prose prose-preview" dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                    <FileText className="w-12 h-12 mb-3" />
                    <p className="text-sm">Nothing to preview yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Start writing your blog post here…"
                    />
                  )}
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" /> Publish Settings
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</Label>
                  <Controller name="status" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={(v) => field.onChange(v as "DRAFT" | "PUBLISHED" | "ARCHIVED")}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400" />Draft</span></SelectItem>
                        <SelectItem value="PUBLISHED"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />Published</span></SelectItem>
                        <SelectItem value="ARCHIVED"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400" />Archived</span></SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">URL Slug</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 flex-shrink-0">/blog/</span>
                    <Input {...register("slug")} className="h-8 text-xs flex-1" />
                  </div>
                  {errors.slug && <p className="text-red-500 text-xs">{errors.slug.message}</p>}
                </div>
                <div className="space-y-2 pt-1">
                  <Button type="button" onClick={handleSubmit(onSubmit)} disabled={saving}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white h-9 text-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                  <Button type="button" onClick={saveAndBack} disabled={saving} variant="outline"
                    className="w-full h-9 text-sm text-slate-600">
                    Save & Back to List
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" /> Post Details
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</Label>
                  <Controller name="category" control={control} render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select category…" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                  <Input {...register("category")} className="h-8 text-sm" placeholder="or custom category" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Tags
                  </Label>
                  <Input {...register("tags")} className="h-8 text-sm" placeholder="health, children, rural" />
                  <p className="text-xs text-slate-400">Separate with commas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> Featured Image
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {featuredImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setValue("featuredImage", "")}
                      className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-500 shadow border border-slate-200 text-xs">✕</button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg h-28 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                    <ImageIcon className="w-6 h-6" /><span>No image set</span>
                  </div>
                )}
                <Input {...register("featuredImage")} className="h-8 text-xs" placeholder="Paste image URL…" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">Post Statistics</h3>
              <div className="space-y-2">
                {[
                  { label: "Words", value: wordCount },
                  { label: "Read time", value: `~${readingTime} min` },
                  { label: "Characters", value: content?.replace(/<[^>]*>/g, "").length ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-xs">
                    <span className="text-blue-600">{label}</span>
                    <span className="font-semibold text-blue-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
