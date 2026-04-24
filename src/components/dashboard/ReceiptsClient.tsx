"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Download, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReceiptReferral {
    memberId: string;
    name: string | null;
    email: string | null;
}

interface ReceiptItem {
    id: string;
    receiptNumber: string;
    amount: number;
    currency: string;
    donorName: string;
    donorEmail: string;
    donorPhone: string | null;
    donorPAN: string | null;
    source: "ONLINE" | "OFFLINE" | "MANUAL";
    paymentMode: string | null;
    paymentReference: string | null;
    transactionId: string | null;
    status: string;
    purpose: string | null;
    paidAt: string | null;
    createdAt: string;
    isReferral: boolean;
    referralCodeUsed: string | null;
    referral: ReceiptReferral | null;
}

interface ReceiptListResponse {
    receipts: ReceiptItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

interface ManualReceiptForm {
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    donorPAN: string;
    amount: string;
    source: "MANUAL" | "OFFLINE";
    paymentMode: "UPI" | "BANK_TRANSFER" | "CASH" | "CHEQUE" | "CARD" | "OTHER";
    paymentReference: string;
    purpose: string;
    notes: string;
    referralCode: string;
}

const EMPTY_FORM: ManualReceiptForm = {
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    donorPAN: "",
    amount: "",
    source: "MANUAL",
    paymentMode: "CASH",
    paymentReference: "",
    purpose: "",
    notes: "",
    referralCode: "",
};

export function ReceiptsClient() {
    const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [source, setSource] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
    const [emailingReceipt, setEmailingReceipt] = useState<string | null>(null);
    const [form, setForm] = useState<ManualReceiptForm>(EMPTY_FORM);

    const fetchReceipts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
                search,
            });

            if (source !== "all") {
                params.set("source", source);
            }

            const res = await fetch(`/api/receipts?${params.toString()}`);
            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Failed to load receipts");
                return;
            }

            const payload = data.data as ReceiptListResponse;
            setReceipts(payload.receipts);
            setTotal(payload.total);
        } catch {
            toast.error("Failed to load receipts");
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, search, source]);

    useEffect(() => {
        fetchReceipts();
    }, [fetchReceipts]);

    const handleFormChange = <K extends keyof ManualReceiptForm>(key: K, value: ManualReceiptForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setForm(EMPTY_FORM);
    };

    const handleCreateReceipt = async () => {
        const amountNumber = Number(form.amount);
        const paymentReference = form.paymentReference.trim();

        if (!form.donorName.trim()) {
            toast.error("Donor name is required");
            return;
        }

        if (!form.donorEmail.trim()) {
            toast.error("Donor email is required");
            return;
        }

        if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
            toast.error("Enter a valid amount");
            return;
        }

        if (form.paymentMode !== "CASH" && !paymentReference) {
            toast.error("Transaction ID / reference is required for non-cash payments");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                donorName: form.donorName.trim(),
                donorEmail: form.donorEmail.trim(),
                donorPhone: form.donorPhone.trim() || undefined,
                donorPAN: form.donorPAN.trim() || undefined,
                amount: amountNumber,
                source: form.source,
                paymentMode: form.paymentMode,
                paymentReference: paymentReference || undefined,
                purpose: form.purpose.trim() || undefined,
                notes: form.notes.trim() || undefined,
                referralCode: form.referralCode.trim() || undefined,
            };

            const res = await fetch("/api/receipts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!data.success) {
                toast.error(data.error || "Failed to generate receipt");
                return;
            }

            const created = data.data;
            toast.success(`Receipt ${created.receiptNumber} generated`);
            setIsCreateOpen(false);
            resetForm();
            await fetchReceipts();

            window.open(`/api/receipts/${created.receiptNumber}/pdf`, "_blank", "noopener,noreferrer");
        } catch {
            toast.error("Failed to generate receipt");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = async (receipt: ReceiptItem) => {
        setDownloadingReceipt(receipt.id);
        try {
            window.open(`/api/receipts/${receipt.receiptNumber}/pdf`, "_blank", "noopener,noreferrer");
        } catch {
            toast.error("Failed to download receipt PDF");
        } finally {
            setDownloadingReceipt(null);
        }
    };

    const handleEmail = async (receipt: ReceiptItem) => {
        setEmailingReceipt(receipt.id);
        try {
            const res = await fetch(`/api/receipts/${receipt.receiptNumber}/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to: receipt.donorEmail }),
            });

            const data = await res.json();
            if (!data.success) {
                toast.error(data.error || "Failed to send receipt email");
                return;
            }

            toast.success(data.message || "Receipt email sent");
        } catch {
            toast.error("Failed to send receipt email");
        } finally {
            setEmailingReceipt(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by receipt no, donor, email..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={source}
                            onValueChange={(value) => {
                                setSource(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="ONLINE">Online</SelectItem>
                                <SelectItem value="MANUAL">Manual</SelectItem>
                                <SelectItem value="OFFLINE">Offline</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Generate Receipt
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Generate Manual Receipt</DialogTitle>
                                <DialogDescription>
                                    Add an offline/manual donation entry and issue receipt instantly.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input placeholder="Donor Name *" value={form.donorName} onChange={(e) => handleFormChange("donorName", e.target.value)} />
                                <Input placeholder="Donor Email *" type="email" value={form.donorEmail} onChange={(e) => handleFormChange("donorEmail", e.target.value)} />
                                <Input placeholder="Donor Phone" value={form.donorPhone} onChange={(e) => handleFormChange("donorPhone", e.target.value)} />
                                <Input placeholder="PAN Number" value={form.donorPAN} onChange={(e) => handleFormChange("donorPAN", e.target.value)} />
                                <Input placeholder="Amount (INR) *" type="number" min="1" value={form.amount} onChange={(e) => handleFormChange("amount", e.target.value)} />
                                <Input placeholder="Purpose" value={form.purpose} onChange={(e) => handleFormChange("purpose", e.target.value)} />
                                <Select value={form.source} onValueChange={(value: "MANUAL" | "OFFLINE") => handleFormChange("source", value)}>
                                    <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MANUAL">Manual</SelectItem>
                                        <SelectItem value="OFFLINE">Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={form.paymentMode} onValueChange={(value: ManualReceiptForm["paymentMode"]) => handleFormChange("paymentMode", value)}>
                                    <SelectTrigger><SelectValue placeholder="Payment Mode" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                                        <SelectItem value="CARD">Card</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder={form.paymentMode === "CASH" ? "Payment Reference (optional)" : "Transaction ID / Payment Reference *"}
                                    value={form.paymentReference}
                                    onChange={(e) => handleFormChange("paymentReference", e.target.value)}
                                />
                                <Input placeholder="Referral Code (optional)" value={form.referralCode} onChange={(e) => handleFormChange("referralCode", e.target.value)} />
                            </div>

                            <p className="text-xs text-slate-500 -mt-1">
                                Transaction ID is mandatory for UPI, bank transfer, cheque, card, and other non-cash payments.
                            </p>

                            <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => handleFormChange("notes", e.target.value)} />

                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                <Button onClick={handleCreateReceipt} disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Create and Download
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Showing {receipts.length} of {total} receipts</p>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="text-xs font-semibold text-slate-600">Receipt #</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Donor</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Details</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Referral</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Date</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-slate-400">Loading receipts...</TableCell>
                                </TableRow>
                            ) : receipts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-slate-400">No receipts found.</TableCell>
                                </TableRow>
                            ) : (
                                receipts.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50">
                                        <TableCell>
                                            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{item.receiptNumber}</code>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-medium text-slate-800">{item.donorName}</p>
                                            <p className="text-xs text-slate-400">{item.donorEmail}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.amount)}</p>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                <Badge className="text-[10px] border bg-slate-50 text-slate-700 border-slate-200">{item.source}</Badge>
                                                <Badge className="text-[10px] border bg-slate-50 text-slate-700 border-slate-200">{PAYMENT_STATUS_LABELS[item.status as keyof typeof PAYMENT_STATUS_LABELS] || item.status}</Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{item.purpose || "General Donation"}</p>
                                            {item.transactionId ? (
                                                <p className="text-[11px] text-slate-400">Txn ID: {item.transactionId}</p>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            {item.isReferral && item.referral ? (
                                                <div>
                                                    <Badge className="text-[10px] border bg-emerald-50 text-emerald-700 border-emerald-200">Referral</Badge>
                                                    <p className="text-xs text-slate-600 mt-1">{item.referral.memberId}</p>
                                                    <p className="text-xs text-slate-500">{item.referral.name || "Unknown"}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">{formatDate(item.paidAt || item.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEmail(item)}
                                                    disabled={emailingReceipt === item.id}
                                                >
                                                    {emailingReceipt === item.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Mail className="w-3.5 h-3.5 mr-1" />}
                                                    Email
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(item)}
                                                    disabled={downloadingReceipt === item.id}
                                                >
                                                    {downloadingReceipt === item.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                                                    PDF
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isLoading}>Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || isLoading}>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
