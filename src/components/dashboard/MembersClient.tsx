"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Plus, CheckCircle, XCircle, Eye, MoreHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { MEMBERSHIP_LABELS } from "@/lib/constants";

interface Member {
    id: string;
    memberId: string;
    membershipType: string;
    isApproved: boolean;
    createdAt: string;
    user: { id: string; name: string; email: string; phone: string | null; isActive: boolean };
}

export function MembersClient() {
    const [members, setMembers] = useState<Member[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [membershipType, setMembershipType] = useState("all");
    const [isApproved, setIsApproved] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const pageSize = 10;

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        const params = new URLSearchParams({
            page: page.toString(), pageSize: pageSize.toString(),
            search, ...(membershipType !== "all" && { membershipType }),
            ...(isApproved !== "all" && { isApproved }),
        });
        const res = await fetch(`/api/members?${params}`);
        const data = await res.json();
        if (data.success) { setMembers(data.data.members); setTotal(data.data.total); }
        setIsLoading(false);
    }, [page, search, membershipType, isApproved]);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    const handleApprove = async (memberId: string) => {
        const res = await fetch(`/api/members/${memberId}/approve`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "approve" }),
        });
        const data = await res.json();
        if (data.success) { toast.success("Member approved!"); fetchMembers(); }
        else toast.error(data.error);
    };

    const handleReject = async (memberId: string) => {
        const reason = prompt("Reason for rejection (optional):");
        const res = await fetch(`/api/members/${memberId}/approve`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reject", reason }),
        });
        const data = await res.json();
        if (data.success) { toast.success("Member rejected."); fetchMembers(); }
        else toast.error(data.error);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or member ID..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <Select value={membershipType} onValueChange={(v) => { setMembershipType(v); setPage(1); }}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {Object.entries(MEMBERSHIP_LABELS).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={isApproved} onValueChange={(v) => { setIsApproved(v); setPage(1); }}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="true">Approved</SelectItem>
                            <SelectItem value="false">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {members.length} of {total} members
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="text-xs font-semibold text-slate-600">Member</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Member ID</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Type</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Joined</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(6)].map((_, j) => (
                                            <TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : members.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-slate-400 py-10">No members found</TableCell>
                                </TableRow>
                            ) : (
                                members.map((member) => (
                                    <TableRow key={member.id} className="hover:bg-slate-50">
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{member.user.name}</p>
                                                <p className="text-xs text-slate-400">{member.user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{member.memberId}</code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {MEMBERSHIP_LABELS[member.membershipType as keyof typeof MEMBERSHIP_LABELS] || member.membershipType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`text-xs ${member.isApproved
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-orange-50 text-orange-700 border-orange-200"
                                                    } border`}
                                            >
                                                {member.isApproved ? "Approved" : "Pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">{formatDate(new Date(member.createdAt))}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {!member.isApproved && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleApprove(member.id)} className="text-emerald-700">
                                                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleReject(member.id)} className="text-red-600">
                                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem>
                                                        <Eye className="w-4 h-4 mr-2" /> View Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                Previous
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
