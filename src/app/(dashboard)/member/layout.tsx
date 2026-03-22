import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberSidebar } from "@/components/dashboard/MemberSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function MemberDashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <MemberSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader user={session.user} />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
