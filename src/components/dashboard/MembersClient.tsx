"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Plus, CheckCircle, XCircle, Eye, MoreHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface MemberDetails extends Member {
    fatherName: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    aadharNumber: string | null;
    occupation: string | null;
    joinDate: string;
    expiryDate: string | null;
    user: Member["user"] & { createdAt: string };
    donations: { id: string; amount: number; status: string; createdAt: string }[];
    certificates: { id: string; certificateNo: string; type: string; issueDate: string }[];
    idCards: { id: string; cardNumber: string; isActive: boolean; issueDate: string; expiryDate: string }[];
}

interface EditMemberForm {
    name: string;
    phone: string;
    fatherName: string;
    dateOfBirth: string;
    gender: "Male" | "Female" | "Other" | "";
    address: string;
    city: string;
    state: string;
    pincode: string;
    aadharNumber: string;
    occupation: string;
    membershipType: "GENERAL" | "LIFETIME" | "HONORARY" | "STUDENT";
}

const EMPTY_EDIT_FORM: EditMemberForm = {
    name: "",
    phone: "",
    fatherName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    aadharNumber: "",
    occupation: "",
    membershipType: "GENERAL",
};

export function MembersClient() {
    const [members, setMembers] = useState<Member[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [membershipType, setMembershipType] = useState("all");
    const [isApproved, setIsApproved] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<MemberDetails | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState<EditMemberForm>(EMPTY_EDIT_FORM);
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

    const loadMemberDetails = async (memberId: string) => {
        const res = await fetch(`/api/members/${memberId}`);
        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to load member details.");
        }

        const member: MemberDetails = data.data;
        setSelectedMember(member);
        setEditForm({
            name: member.user.name || "",
            phone: member.user.phone || "",
            fatherName: member.fatherName || "",
            dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : "",
            gender: (member.gender as "Male" | "Female" | "Other" | null) || "",
            address: member.address || "",
            city: member.city || "",
            state: member.state || "",
            pincode: member.pincode || "",
            aadharNumber: member.aadharNumber || "",
            occupation: member.occupation || "",
            membershipType: (member.membershipType as EditMemberForm["membershipType"]) || "GENERAL",
        });
    };

    const handleViewDetails = async (memberId: string) => {
        try {
            setIsDetailsOpen(true);
            setIsDetailsLoading(true);
            setSelectedMember(null);
            setIsEditing(false);
            setEditForm(EMPTY_EDIT_FORM);

            await loadMemberDetails(memberId);
        } catch {
            toast.error("Failed to load member details.");
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleSaveMember = async () => {
        if (!selectedMember) return;
        if (!editForm.name.trim()) {
            toast.error("Name is required.");
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                name: editForm.name.trim(),
                phone: editForm.phone.trim() || undefined,
                fatherName: editForm.fatherName.trim() || undefined,
                dateOfBirth: editForm.dateOfBirth || undefined,
                gender: editForm.gender || undefined,
                address: editForm.address.trim() || undefined,
                city: editForm.city.trim() || undefined,
                state: editForm.state.trim() || undefined,
                pincode: editForm.pincode.trim() || undefined,
                aadharNumber: editForm.aadharNumber.trim() || undefined,
                occupation: editForm.occupation.trim() || undefined,
                membershipType: editForm.membershipType,
            };

            const res = await fetch(`/api/members/${selectedMember.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!data.success) {
                toast.error(data.error || "Failed to update member.");
                return;
            }

            await loadMemberDetails(selectedMember.id);
            await fetchMembers();
            setIsEditing(false);
            toast.success("Member updated successfully.");
        } catch {
            toast.error("Failed to update member.");
        } finally {
            setIsSaving(false);
        }
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
                                                    <DropdownMenuItem onClick={() => handleViewDetails(member.id)}>
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

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Member Details</DialogTitle>
                        <DialogDescription>
                            Complete profile and activity details for the selected member.
                        </DialogDescription>
                    </DialogHeader>

                    {isDetailsLoading ? (
                        <div className="space-y-3 py-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : !selectedMember ? (
                        <p className="text-sm text-slate-500">No details available.</p>
                    ) : (
                        <div className="space-y-6 text-sm">
                            <div className="flex items-center justify-end gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                                        <Button onClick={handleSaveMember} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)}>Edit Member</Button>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 mb-2">Basic Info</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                                    <p>
                                        <span className="font-medium text-slate-800">Name:</span>{" "}
                                        {isEditing ? (
                                            <Input
                                                value={editForm.name}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                                className="mt-1"
                                            />
                                        ) : selectedMember.user.name}
                                    </p>
                                    <p><span className="font-medium text-slate-800">Email:</span> {selectedMember.user.email}</p>
                                    <p>
                                        <span className="font-medium text-slate-800">Phone:</span>{" "}
                                        {isEditing ? (
                                            <Input
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                                                className="mt-1"
                                            />
                                        ) : (selectedMember.user.phone || "-")}
                                    </p>
                                    <p><span className="font-medium text-slate-800">Member ID:</span> {selectedMember.memberId}</p>
                                    <p><span className="font-medium text-slate-800">Status:</span> {selectedMember.isApproved ? "Approved" : "Pending"}</p>
                                    <p><span className="font-medium text-slate-800">Account:</span> {selectedMember.user.isActive ? "Active" : "Inactive"}</p>
                                    <p>
                                        <span className="font-medium text-slate-800">Type:</span>{" "}
                                        {isEditing ? (
                                            <Select
                                                value={editForm.membershipType}
                                                onValueChange={(v) => setEditForm((prev) => ({ ...prev, membershipType: v as EditMemberForm["membershipType"] }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(MEMBERSHIP_LABELS).map(([k, v]) => (
                                                        <SelectItem key={k} value={k}>{v}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (MEMBERSHIP_LABELS[selectedMember.membershipType as keyof typeof MEMBERSHIP_LABELS] || selectedMember.membershipType)}
                                    </p>
                                    <p><span className="font-medium text-slate-800">Joined:</span> {formatDate(new Date(selectedMember.joinDate))}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 mb-2">Profile Info</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                                    <p>
                                        <span className="font-medium text-slate-800">Father Name:</span>{" "}
                                        {isEditing ? (
                                            <Input value={editForm.fatherName} onChange={(e) => setEditForm((prev) => ({ ...prev, fatherName: e.target.value }))} className="mt-1" />
                                        ) : (selectedMember.fatherName || "-")}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-800">Date of Birth:</span>{" "}
                                        {isEditing ? (
                                            <Input type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} className="mt-1" />
                                        ) : (selectedMember.dateOfBirth ? formatDate(new Date(selectedMember.dateOfBirth)) : "-")}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-800">Gender:</span>{" "}
                                        {isEditing ? (
                                            <select
                                                value={editForm.gender}
                                                onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value as EditMemberForm["gender"] }))}
                                                className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        ) : (selectedMember.gender || "-")}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-800">Occupation:</span>{" "}
                                        {isEditing ? (
                                            <Input value={editForm.occupation} onChange={(e) => setEditForm((prev) => ({ ...prev, occupation: e.target.value }))} className="mt-1" />
                                        ) : (selectedMember.occupation || "-")}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-800">Aadhar:</span>{" "}
                                        {isEditing ? (
                                            <Input value={editForm.aadharNumber} onChange={(e) => setEditForm((prev) => ({ ...prev, aadharNumber: e.target.value }))} className="mt-1" />
                                        ) : (selectedMember.aadharNumber || "-")}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-800">Pincode:</span>{" "}
                                        {isEditing ? (
                                            <Input value={editForm.pincode} onChange={(e) => setEditForm((prev) => ({ ...prev, pincode: e.target.value }))} className="mt-1" />
                                        ) : (selectedMember.pincode || "-")}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-800">City:</span>{" "}
                                        {isEditing ? (
                                            <Input value={editForm.city} onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))} className="mt-1" />
                                        ) : (selectedMember.city || "-")}
                                    </p>
                                    <p>
                                        <span className="font-medium text-slate-800">State:</span>{" "}
                                        {isEditing ? (
                                            <Input value={editForm.state} onChange={(e) => setEditForm((prev) => ({ ...prev, state: e.target.value }))} className="mt-1" />
                                        ) : (selectedMember.state || "-")}
                                    </p>
                                </div>
                                <div className="text-slate-600 mt-2">
                                    <span className="font-medium text-slate-800">Address:</span>{" "}
                                    {isEditing ? (
                                        <Textarea
                                            value={editForm.address}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                                            className="mt-1"
                                        />
                                    ) : (selectedMember.address || "-")}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 mb-2">Activity Summary</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                                    <p><span className="font-medium text-slate-800">Donations:</span> {selectedMember.donations.length}</p>
                                    <p><span className="font-medium text-slate-800">Certificates:</span> {selectedMember.certificates.length}</p>
                                    <p><span className="font-medium text-slate-800">ID Cards:</span> {selectedMember.idCards.length}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
