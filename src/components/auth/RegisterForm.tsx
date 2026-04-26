"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, Link2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { z } from "zod";

type RegisterFormInput = z.input<typeof registerSchema>;
type RegisterFormOutput = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const [welcomeEmailSent, setWelcomeEmailSent] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const referralCode = searchParams.get("ref")?.trim() || "";

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormInput, any, RegisterFormOutput>({
        resolver: zodResolver(registerSchema),
    });

    useEffect(() => {
        setValue("referralCode", referralCode || undefined);
    }, [referralCode, setValue]);

    const onSubmit = async (data: RegisterFormOutput) => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!result.success) {
                toast.error(result.error || "Registration failed. Please try again.");
                return;
            }
            const emailSent = Boolean(result.emailSent);
            setWelcomeEmailSent(emailSent);
            setSuccess(true);
            if (emailSent) {
                toast.success("Registration successful! Welcome email sent.");
            } else {
                toast.warning("Registration successful, but we could not send your welcome email right now.");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                className="text-center py-6"
            >
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-slate-800 font-serif text-3xl font-bold mb-4">Registration Successful!</h3>
                <p className="text-slate-500 text-base mb-8 font-light leading-relaxed">
                    {welcomeEmailSent
                        ? "A welcome email has been sent. Your membership is currently pending admin approval."
                        : "Your membership is currently pending admin approval. We could not send the welcome email at the moment."}
                </p>
                <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="rounded-full px-8 py-6 text-base font-medium text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 shadow-none w-full"
                >
                    Proceed to Login
                </Button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {referralCode && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                    <Link2 className="w-4 h-4 text-emerald-700 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Referral Applied</p>
                        <p className="text-sm text-emerald-900 mt-1">This registration will be linked to member code: <span className="font-bold">{referralCode}</span></p>
                    </div>
                </div>
            )}

            <div>
                <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase ml-1">Full Name *</Label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        {...register("name")}
                        placeholder="Your full name"
                        className="pl-12 h-14 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-500 shadow-sm transition-all"
                    />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.name.message}</p>}
            </div>

            <div>
                <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase ml-1">Email Address *</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        {...register("email")}
                        type="email"
                        placeholder="your@email.com"
                        className="pl-12 h-14 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-500 shadow-sm transition-all"
                    />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.email.message}</p>}
            </div>

            <div>
                <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase ml-1">Phone Number</Label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        {...register("phone")}
                        type="tel"
                        placeholder="10-digit mobile number"
                        className="pl-12 h-14 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-500 shadow-sm transition-all"
                    />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.phone.message}</p>}
            </div>

            <div>
                <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase ml-1">Register As *</Label>
                <div className="relative">
                    <select
                        {...register("position")}
                        className="w-full h-14 pl-4 pr-10 rounded-2xl bg-slate-50/50 border border-slate-200 text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm transition-all appearance-none"
                    >
                        <option value="">Select your position...</option>
                        <option value="Volunteer">Volunteer</option>
                        <option value="Manager">Manager</option>
                        <option value="General Member">General Member</option>
                        <option value="Team Member">Team Member</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                {errors.position && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.position.message as string}</p>}
            </div>

            <input type="hidden" {...register("referralCode")} />

            <div>
                <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase ml-1">Password *</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        className="pl-12 pr-12 h-14 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-500 shadow-sm transition-all text-sm"
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

            <div>
                <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase ml-1">Confirm Password *</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        {...register("confirmPassword")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        className="pl-12 h-14 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-amber-500 shadow-sm transition-all text-sm"
                    />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-2">
                <input
                    type="checkbox"
                    id="agreeToTerms"
                    {...register("agreeToTerms")}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="agreeToTerms" className="text-slate-500 text-sm font-light leading-relaxed cursor-pointer select-none">
                    I agree to the foundation rules. Note: Registration requires subsequent admin approval.
                </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-xs -mt-1 ml-2 font-medium">{errors.agreeToTerms.message}</p>}

            <div className="pt-2">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-bold shadow-lg shadow-slate-900/10 transition-all duration-300 hover:scale-[1.02]"
                >
                    {isLoading ? (
                        <><Loader2 className="w-5 h-5 mr-3 animate-spin text-amber-500" /> Processing...</>
                    ) : (
                        "Submit Application"
                    )}
                </Button>
            </div>
        </form>
    );
}
