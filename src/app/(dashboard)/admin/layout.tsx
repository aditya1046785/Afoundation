import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    if (!["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) {
        redirect("/member/dashboard");
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <AdminSidebar role={session.user.role} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader user={session.user} />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
