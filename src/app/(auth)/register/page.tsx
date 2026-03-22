import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
    title: "Register | Nirashray Foundation",
    description: "Become a member of Nirashray Foundation and join our mission.",
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-amber-400 fill-amber-400" />
                        </div>
                        <div>
                            <p className="font-serif text-2xl font-bold text-white">Nirashray Foundation</p>
                            <p className="text-blue-300 text-sm">Join our mission of hope</p>
                        </div>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <h1 className="font-serif text-2xl font-bold text-white text-center mb-2">Become a Member</h1>
                    <p className="text-blue-200 text-center text-sm mb-8">Create your free account</p>
                    <RegisterForm />
                </div>

                <p className="text-center text-blue-300 text-sm mt-6">
                    Already a member?{" "}
                    <Link href="/login" className="text-amber-400 font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
                <p className="text-center mt-2">
                    <Link href="/" className="text-blue-400 text-xs hover:text-white transition-colors">
                        ← Back to Website
                    </Link>
                </p>
            </div>
        </div>
    );
}
