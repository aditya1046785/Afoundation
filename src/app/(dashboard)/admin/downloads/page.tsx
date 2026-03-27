"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Download } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";

interface Document {
    id: string; title: string; description: string | null; fileUrl: string;
    fileSize: string | null; category: string; downloadCount: number; isVisible: boolean;
}

export default function AdminDownloadsPage() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { register, handleSubmit, setValue, reset } = useForm<{
        title: string; description: string; fileUrl: string;
        fileSize: string; category: string;
    }>({
        defaultValues: { category: "Legal Documents", title: "", description: "", fileUrl: "", fileSize: "" },
    });

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/downloads?admin=true");
        const data = await res.json();
        if (data.success) setDocs(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const onSubmit = async (data: any) => {
        setSaving(true);
        const res = await fetch("/api/downloads", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) { toast.success("Document added!"); reset(); setDialogOpen(false); fetch_(); }
        else toast.error(result.error || "Failed.");
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this document?")) return;
        const res = await fetch(`/api/downloads/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { toast.success("Deleted."); fetch_(); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Downloads</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage downloadable documents</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-800 hover:bg-blue-900 text-white"><Plus className="w-4 h-4 mr-2" /> Add Document</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div><Label>Title *</Label><Input {...register("title")} /></div>
                            <div><Label>Description</Label><Textarea {...register("description")} rows={2} /></div>
                            <div><Label>File URL *</Label><Input {...register("fileUrl")} placeholder="https://..." /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><Label>File Size</Label><Input {...register("fileSize")} placeholder="2.5 MB" /></div>
                                <div>
                                    <Label>Category</Label>
                                    <Select defaultValue="Legal Documents" onValueChange={(v) => setValue("category", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {DOCUMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" disabled={saving} className="w-full bg-blue-800 hover:bg-blue-900 text-white">
                                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : <><Download className="w-4 h-4 mr-2" /> Add Document</>}
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
                                <TableHead className="text-xs font-semibold">Title</TableHead>
                                <TableHead className="text-xs font-semibold">Category</TableHead>
                                <TableHead className="text-xs font-semibold">Downloads</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(3)].map((_, i) => <TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>)}</TableRow>)
                            ) : docs.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-10">No documents</TableCell></TableRow>
                            ) : docs.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell>
                                        <p className="text-sm font-medium text-slate-800">{d.title}</p>
                                        {d.fileSize && <p className="text-xs text-slate-400">{d.fileSize}</p>}
                                    </TableCell>
                                    <TableCell><Badge variant="outline" className="text-xs">{d.category}</Badge></TableCell>
                                    <TableCell className="text-sm text-slate-500">{d.downloadCount}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
