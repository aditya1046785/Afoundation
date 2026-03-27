"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Calendar, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { z } from "zod";

type EventFormData = z.input<typeof eventSchema>;

interface Event {
    id: string; title: string; slug: string; description: string;
    date: string; time: string; venue: string; image: string | null;
    isPublished: boolean; createdAt: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema) as any,
        defaultValues: { title: "", slug: "", description: "", date: "", time: "", venue: "", image: "", isPublished: false },
    });

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/events?admin=true");
        const data = await res.json();
        if (data.success) setEvents(data.data.events || data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const onSubmit = async (data: EventFormData) => {
        setSaving(true);
        const res = await fetch("/api/events", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
            toast.success("Event created!");
            reset();
            setDialogOpen(false);
            fetchEvents();
        } else { toast.error(result.error || "Failed to create event."); }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this event?")) return;
        const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { toast.success("Event deleted."); fetchEvents(); }
        else toast.error(data.error);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Events</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage upcoming and past events</p>
                </div>
                <Button asChild className="bg-blue-800 hover:bg-blue-900 text-white">
                    <Link href="/admin/events/new">
                        <Plus className="w-4 h-4 mr-2" /> Add Event
                    </Link>
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Event</TableHead>
                                    <TableHead className="text-xs font-semibold">Date & Venue</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <TableRow key={i}>{[...Array(4)].map((_, j) => (<TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>))}</TableRow>
                                    ))
                                ) : events.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-10">No events yet</TableCell></TableRow>
                                ) : (
                                    events.map((event) => (
                                        <TableRow key={event.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-800">{event.title}</p>
                                                <div className="text-xs text-slate-400 line-clamp-1 prose-sm prose-slate prose-p:my-0 prose-headings:my-0" dangerouslySetInnerHTML={{ __html: event.description }} />
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-slate-600">{formatDate(new Date(event.date))}</p>
                                                <p className="text-xs text-slate-400">{event.time} · {event.venue}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs border ${new Date(event.date) > new Date() ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                                    {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
