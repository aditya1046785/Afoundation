import { Metadata } from "next";
import { MembersClient } from "@/components/dashboard/MembersClient";

export const metadata: Metadata = { title: "Members | Admin Dashboard" };

export default function MembersPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">Members</h1>
                <p className="text-slate-500 text-sm mt-1">Manage member registrations and approvals</p>
            </div>
            <MembersClient />
        </div>
    );
}
