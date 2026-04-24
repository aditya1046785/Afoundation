import { Metadata } from "next";
import { ReceiptsClient } from "@/components/dashboard/ReceiptsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Receipts | Admin Dashboard" };

export default function AdminReceiptsPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">Receipts</h1>
                <p className="text-slate-500 text-sm mt-1">Manage donation receipts and generate manual entries for offline contributions</p>
            </div>
            <ReceiptsClient />
        </div>
    );
}
