"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { TEAM_CATEGORIES } from "@/lib/constants";
import Image from "next/image";
import type { z } from "zod";

// Types are defined below

interface TeamMember {
    id: string; name: string; role: string; category: string;
    photo: string | null; bio: string | null; displayOrder: number;
}

export default function AdminTeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/team?admin=true");
        const data = await res.json();
        if (data.success) setMembers(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this team member?")) return;
        const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { toast.success("Removed."); fetch_(); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Team Members</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage team display on the website</p>
                </div>
                <Button asChild className="bg-blue-800 hover:bg-blue-900 text-white">
                    <Link href="/admin/team/new">
                        <Plus className="w-4 h-4 mr-2" /> Add Member
                    </Link>
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="text-xs font-semibold">Photo</TableHead>
                                <TableHead className="text-xs font-semibold">Name & Role</TableHead>
                                <TableHead className="text-xs font-semibold">Category</TableHead>
                                <TableHead className="text-xs font-semibold">Order</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(3)].map((_, i) => <TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>)}</TableRow>)
                            ) : members.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-10">No team members yet</TableCell></TableRow>
                            ) : members.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>
                                        {m.photo ? (
                                            <Image src={m.photo} alt={m.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-300 text-xs font-bold">{m.name.charAt(0)}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium text-slate-800">{m.name}</p>
                                        <p className="text-xs text-slate-400">{m.role}</p>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">{m.category}</TableCell>
                                    <TableCell className="text-sm text-slate-400">{m.displayOrder}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
