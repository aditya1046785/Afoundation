"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announcementSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ANNOUNCEMENT_COLORS } from "@/lib/constants";
import type { z } from "zod";

type AnnouncementFormData = z.input<typeof announcementSchema>;

interface Announcement {
    id: string; message: string; linkText: string | null; linkUrl: string | null;
    type: string; isActive: boolean; startDate: string; endDate: string | null;
}

export default function AdminAnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AnnouncementFormData>({
        resolver: zodResolver(announcementSchema) as any,
        defaultValues: { type: "INFO", isActive: true, message: "", startDate: "" },
    });

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/announcements?admin=true");
        const data = await res.json();
        if (data.success) setItems(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const onSubmit = async (data: AnnouncementFormData) => {
        setSaving(true);
        const res = await fetch("/api/announcements", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) { toast.success("Announcement created!"); reset(); setDialogOpen(false); fetch_(); }
        else toast.error(result.error || "Failed.");
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete?")) return;
        const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { toast.success("Deleted."); fetch_(); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Announcements</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage site-wide announcements</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-800 hover:bg-blue-900 text-white"><Plus className="w-4 h-4 mr-2" /> New</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div><Label>Message *</Label><Input {...register("message")} />{errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}</div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><Label>Link Text</Label><Input {...register("linkText")} placeholder="Learn More" /></div>
                                <div><Label>Link URL</Label><Input {...register("linkUrl")} placeholder="/events" /></div>
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select defaultValue="INFO" onValueChange={(v) => setValue("type", v as any)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["INFO", "URGENT", "SUCCESS", "WARNING"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><Label>Start Date *</Label><Input {...register("startDate")} type="date" /></div>
                                <div><Label>End Date</Label><Input {...register("endDate")} type="date" /></div>
                            </div>
                            <Button type="submit" disabled={saving} className="w-full bg-blue-800 hover:bg-blue-900 text-white">
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Megaphone className="w-4 h-4 mr-2" />}
                                Create
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
                                <TableHead className="text-xs font-semibold">Message</TableHead>
                                <TableHead className="text-xs font-semibold">Type</TableHead>
                                <TableHead className="text-xs font-semibold">Dates</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(2)].map((_, i) => <TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>)}</TableRow>)
                            ) : items.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-10">No announcements</TableCell></TableRow>
                            ) : items.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell className="text-sm text-slate-800">{a.message}</TableCell>
                                    <TableCell><Badge className={`text-xs text-white ${ANNOUNCEMENT_COLORS[a.type as keyof typeof ANNOUNCEMENT_COLORS] || "bg-blue-500"}`}>{a.type}</Badge></TableCell>
                                    <TableCell className="text-xs text-slate-500">{formatDate(new Date(a.startDate))}{a.endDate ? ` — ${formatDate(new Date(a.endDate))}` : ""}</TableCell>
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
