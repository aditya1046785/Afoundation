import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle2, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Approval Pending | Nirashray Foundation",
    description: "Your membership application is still under review.",
};

export default async function PendingApprovalPage() {
    const session = await auth();
    
    // If not logged in, redirect to login
    if (!session?.user) {
        redirect("/login");
    }

    // Check current approval status from database
    const member = await prisma.member.findUnique({
        where: { userId: session.user.id },
        select: { isApproved: true },
    });

    // If member is now approved, redirect to login to refresh session
    if (member?.isApproved) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#fdfcfa] flex items-center justify-center p-4 relative overflow-hidden font-light">
            <div className="absolute inset-0 opacity-[0.22] pointer-events-none mix-blend-multiply" style={{
                backgroundImage: `radial-gradient(circle at 20% 20%, rgba(251,191,36,0.25), transparent 30%), radial-gradient(circle at 80% 30%, rgba(59,130,246,0.18), transparent 28%), radial-gradient(circle at 50% 80%, rgba(16,185,129,0.16), transparent 30%)`,
            }} />

            <div className="w-full max-w-2xl relative z-10">
                <div className="bg-white/80 backdrop-blur-md border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] rounded-[2.5rem] p-8 md:p-12 text-center overflow-hidden relative">
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 shadow-sm">
                        <ShieldAlert className="w-8 h-8 text-amber-600" />
                    </div>

                    <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-600 mb-3">Membership Review</p>
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4">Your account is pending approval</h1>
                    <p className="text-slate-600 max-w-xl mx-auto leading-7">
                        Your registration has been received successfully. You will be able to sign in and access the member dashboard once an admin approves your account.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900">What happens next</h2>
                            </div>
                            <p className="text-sm text-slate-600 leading-6">
                                The team will review your application, verify your details, and approve your membership when everything is complete.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <Mail className="w-5 h-5 text-amber-600" />
                                <h2 className="font-semibold text-slate-900">Need help?</h2>
                            </div>
                            <p className="text-sm text-slate-600 leading-6">
                                If you believe this is a mistake, please contact the foundation team for support.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto rounded-2xl px-6 h-12">Go to Home</Button>
                        </Link>
                        <Link href="/contact" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto rounded-2xl px-6 h-12 bg-slate-900 hover:bg-slate-800">Contact Support</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
