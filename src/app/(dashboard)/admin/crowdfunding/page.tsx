"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Target, Eye, EyeOff } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Campaign {
    id: string; title: string; description: string;
    target: number; raised: number; image: string;
    category: string; isActive: boolean; createdAt: string;
}

export default function AdminCrowdfundingPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/crowdfunding");
        const data = await res.json();
        if (data.success) setCampaigns(data.data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this campaign?")) return;
        const res = await fetch(`/api/crowdfunding/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { 
            toast.success("Campaign deleted."); 
            fetchCampaigns(); 
        } else {
            toast.error(data.error);
        }
    };

    const handleToggleActive = async (cam: Campaign) => {
        const res = await fetch(`/api/crowdfunding/${cam.id}`, { 
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !cam.isActive })
        });
        const result = await res.json();
        if (result.success) {
            toast.success(cam.isActive ? "Hidden from frontend." : "Visible on frontend.");
            fetchCampaigns();
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900">Crowdfunding</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage active donation campaigns</p>
                </div>
                <Link href="/admin/crowdfunding/new">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-md">
                        <Plus className="w-4 h-4 mr-2" /> New Campaign
                    </Button>
                </Link>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-xs font-semibold">Campaign Info</TableHead>
                                    <TableHead className="text-xs font-semibold">Category</TableHead>
                                    <TableHead className="text-xs font-semibold">Goal / Raised</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <TableRow key={i}>{[...Array(5)].map((_, j) => (<TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-full max-w-[100px]" /></TableCell>))}</TableRow>
                                    ))
                                ) : campaigns.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-10">No campaigns found. Create one!</TableCell></TableRow>
                                ) : (
                                    campaigns.map((cam) => {
                                        const progress = Math.min(100, Math.round((cam.raised / cam.target) * 100));
                                        
                                        return (
                                            <TableRow key={cam.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-amber-500" /> {cam.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[300px]">{cam.description}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(new Date(cam.createdAt))}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50 rounded-full">{cam.category}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-medium">
                                                        <span className="text-emerald-600">{formatCurrency(cam.raised)}</span>
                                                        <span className="text-slate-400 mx-1">/</span>
                                                        <span className="text-slate-800">{formatCurrency(cam.target)}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                                                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge onClick={() => handleToggleActive(cam)} className={`text-xs border cursor-pointer hover:opacity-80 transition-opacity ${cam.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                                        {cam.isActive ? <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> Active</span> : <span className="flex items-center gap-1"><EyeOff className="w-3 h-3"/> Hidden</span>}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right whitespace-nowrap">
                                                    <Link href={`/admin/crowdfunding/${cam.id}/edit`}>
                                                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800 mr-2">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cam.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
