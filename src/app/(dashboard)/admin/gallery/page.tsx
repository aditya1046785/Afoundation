"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Images } from "lucide-react";
import Image from "next/image";

interface Album {
    id: string; title: string; slug: string; description: string | null;
    coverImage: string | null; isVisible: boolean; isFeatured: boolean;
    _count: { photos: number };
}

export default function AdminGalleryPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/gallery/albums?admin=true");
        const data = await res.json();
        if (data.success) setAlbums(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const onSubmit = async (data: any) => {
        setSaving(true);
        const res = await fetch("/api/gallery/albums", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) { toast.success("Album created!"); reset(); setDialogOpen(false); fetch_(); }
        else toast.error(result.error || "Failed.");
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this album and all photos?")) return;
        const res = await fetch(`/api/gallery/albums/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { toast.success("Deleted."); fetch_(); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Gallery Albums</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage photo albums</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-800 hover:bg-blue-900 text-white"><Plus className="w-4 h-4 mr-2" /> New Album</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create Album</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div><Label>Title *</Label><Input {...register("title")} /></div>
                            <div><Label>Slug *</Label><Input {...register("slug")} /></div>
                            <div><Label>Description</Label><Textarea {...register("description")} rows={2} /></div>
                            <div><Label>Cover Image URL</Label><Input {...register("coverImage")} /></div>
                            <Button type="submit" disabled={saving} className="w-full bg-blue-800 hover:bg-blue-900 text-white">
                                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><Images className="w-4 h-4 mr-2" /> Create Album</>}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="text-xs font-semibold">Cover</TableHead>
                                <TableHead className="text-xs font-semibold">Album</TableHead>
                                <TableHead className="text-xs font-semibold">Photos</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(3)].map((_, i) => <TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>)}</TableRow>)
                            ) : albums.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-10">No albums yet</TableCell></TableRow>
                            ) : albums.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>
                                        {a.coverImage ? (
                                            <Image src={a.coverImage} alt={a.title} width={60} height={40} className="w-16 h-10 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-16 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><Images className="w-4 h-4 text-slate-300" /></div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium text-slate-800">{a.title}</p>
                                        <p className="text-xs text-slate-400">/{a.slug}</p>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">{a._count.photos} photos</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
