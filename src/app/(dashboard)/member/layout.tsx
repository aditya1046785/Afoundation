import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberSidebar } from "@/components/dashboard/MemberSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import prisma from "@/lib/prisma";

export default async function MemberDashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    if (session.user.role !== "MEMBER") {
        redirect("/admin");
    }

    const member = await prisma.member.findUnique({
        where: { userId: session.user.id },
        select: { isApproved: true },
    });

    if (!member?.isApproved) redirect("/pending-approval");

    return (
        <div className="flex h-screen bg-[#fdfcfa] font-light overflow-hidden">
            <MemberSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader user={session.user} />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
