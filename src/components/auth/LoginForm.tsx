"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Lock, UserCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [fetchedPosition, setFetchedPosition] = useState<string | null>(null);
    const [isFetchingInfo, setIsFetchingInfo] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const emailValue = watch("email");

    const checkEmailPosition = async () => {
        if (!emailValue || !emailValue.includes("@")) {
            setFetchedPosition(null);
            return;
        }
        
        try {
            setIsFetchingInfo(true);
            const res = await fetch(`/api/auth/position?email=${encodeURIComponent(emailValue)}`);
            const data = await res.json();
            if (data.success && data.position) {
                setFetchedPosition(data.position);
            } else {
                setFetchedPosition(null);
            }
        } catch {
            // Ignore errors for progressive enhancement
        } finally {
            setIsFetchingInfo(false);
        }
    };

    const onSubmit = async (data: LoginFormData) => {
        try {
            setIsLoading(true);

            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error || !result?.ok) {
                toast.error("Invalid email or password. Please try again.");
                return;
            }

            toast.success("Welcome back!");

            const res = await fetch("/api/auth/session");
            const session = await res.json();
            const role = session?.user?.role;

            if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") {
                window.location.replace("/admin");
            } else {
                window.location.replace("/member/dashboard");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence>
                {fetchedPosition && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <UserCircle2 className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-600/80 font-bold tracking-widest uppercase mb-0.5">Found Account</p>
                            <p className="text-sm text-slate-700 font-medium">Registered as: <span className="font-bold text-slate-900">{fetchedPosition}</span></p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <Label htmlFor="email" className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase ml-1">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        autoComplete="email"
                        onBlur={checkEmailPosition}
                        placeholder="your@email.com"
                        className="pl-12 h-14 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-500 shadow-sm transition-all"
                    />
                    {isFetchingInfo && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        </div>
                    )}
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.email.message}</p>}
            </div>

            <div>
                <Label htmlFor="password" className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase ml-1">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        {...register("password")}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-14 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-500 shadow-sm transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.password.message}</p>}
            </div>

            <div className="pt-2">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-bold shadow-lg shadow-slate-900/10 transition-all duration-300 hover:scale-[1.02]"
                >
                    {isLoading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin text-amber-500" /> Authenticating...</> : "Sign In securely"}
                </Button>
            </div>
        </form>
    );
}
