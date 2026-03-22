"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { z } from "zod";

type RegisterFormInput = z.input<typeof registerSchema>;
type RegisterFormOutput = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInput, any, RegisterFormOutput>({
        resolver: zodResolver(registerSchema),
    });

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
            setSuccess(true);
            toast.success("Registration successful! You can now login.");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-white font-serif text-xl font-bold mb-2">Registration Successful!</h3>
                <p className="text-blue-200 text-sm mb-6">
                    A welcome email has been sent. Your membership is pending admin approval.
                </p>
                <Button
                    onClick={() => router.push("/login")}
                    className="bg-amber-500 hover:bg-amber-400 text-white"
                >
                    Go to Login
                </Button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label className="text-white/80 text-sm mb-1.5 block">Full Name *</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        {...register("name")}
                        placeholder="Your full name"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400"
                    />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <Label className="text-white/80 text-sm mb-1.5 block">Email Address *</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        {...register("email")}
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400"
                    />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
                <Label className="text-white/80 text-sm mb-1.5 block">Phone Number</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        {...register("phone")}
                        type="tel"
                        placeholder="10-digit mobile number"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400"
                    />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <Label className="text-white/80 text-sm mb-1.5 block">Password *</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
                <Label className="text-white/80 text-sm mb-1.5 block">Confirm Password *</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        {...register("confirmPassword")}
                        type="password"
                        placeholder="Re-enter password"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-amber-400"
                    />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    id="agreeToTerms"
                    {...register("agreeToTerms")}
                    className="mt-1 w-4 h-4 accent-amber-400 cursor-pointer"
                />
                <label htmlFor="agreeToTerms" className="text-white/60 text-xs leading-relaxed cursor-pointer">
                    I agree to the terms & conditions. My membership will be activated after admin approval.
                </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-400 text-xs -mt-2">{errors.agreeToTerms.message}</p>}

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 mt-2"
            >
                {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</>
                ) : (
                    "Create Account"
                )}
            </Button>
        </form>
    );
}
