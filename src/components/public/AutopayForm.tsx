"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { autopaySchema } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Heart, Loader2, CheckCircle, RotateCw } from "lucide-react";
import type { z } from "zod";

interface AutopayFormProps {
    purposes: string[];
}

type AutopayFormData = z.input<typeof autopaySchema>;

export function AutopayForm({ purposes }: AutopayFormProps) {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AutopayFormData>({
        resolver: zodResolver(autopaySchema),
        defaultValues: {
            amount: 500,
            frequency: "MONTHLY",
            donorName: "",
            donorEmail: "",
            donorPhone: "",
            donorPAN: "",
            purpose: "",
            message: "",
            referralCode: undefined,
        },
    });

    const watchedAmount = watch("amount");
    const watchedFrequency = watch("frequency");
    const watchedPurpose = watch("purpose");

    const submitLabel =
        watchedFrequency === "WEEKLY"
            ? "Start Weekly Donation"
            : watchedFrequency === "MONTHLY"
                ? "Start Monthly Donation"
                : "Start Yearly Donation";

    const referralCode = searchParams.get("ref")?.trim() || "";
    const prefillName = searchParams.get("name")?.trim() || "";
    const prefillEmail = searchParams.get("email")?.trim() || "";
    const prefillPhone = searchParams.get("phone")?.trim() || "";
    const prefillPAN = searchParams.get("pan")?.trim() || "";

    useEffect(() => {
        setValue("referralCode", referralCode || undefined);
    }, [referralCode, setValue]);

    useEffect(() => {
        if (prefillName) setValue("donorName", prefillName);
        if (prefillEmail) setValue("donorEmail", prefillEmail);
        if (prefillPhone) setValue("donorPhone", prefillPhone);
        if (prefillPAN) setValue("donorPAN", prefillPAN);
    }, [prefillName, prefillEmail, prefillPhone, prefillPAN, setValue]);

    const normalizeAutopayPayload = (data: AutopayFormData) => {
        const payload: Record<string, unknown> = {
            amount: data.amount,
            frequency: data.frequency,
            donorName: data.donorName.trim(),
            donorEmail: data.donorEmail.trim(),
        };

        const donorPhone = data.donorPhone?.trim();
        const donorPAN = data.donorPAN?.trim();
        const purpose = data.purpose?.trim();
        const message = data.message?.trim();
        const cleanedReferralCode = data.referralCode?.trim();

        if (donorPhone) payload.donorPhone = donorPhone;
        if (donorPAN) payload.donorPAN = donorPAN.toUpperCase();
        if (purpose) payload.purpose = purpose;
        if (message) payload.message = message;
        if (cleanedReferralCode) payload.referralCode = cleanedReferralCode;

        return payload;
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = resolve;
            document.body.appendChild(script);
        });
    };

    const onSubmit = async (data: AutopayFormData) => {
        try {
            console.log("Autopay form submitted", data);
            setIsLoading(true);
            await loadRazorpay();

            const payload = normalizeAutopayPayload(data);
            console.log("Create-autopay-subscription payload", payload);

            const res = await fetch("/api/autopay/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseData = await res.json();
            console.log("Create-autopay-subscription response", responseData);

            const { success, data: subscriptionData, error } = responseData;
            if (!success) {
                throw new Error(error || "Failed to create autopay subscription");
            }

            console.log("Subscription created", subscriptionData);

            // Open Razorpay checkout for subscription
            const rzp = new (window as any).Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: subscriptionData.razorpaySubscriptionId,
                name: "Nirashray Foundation",
                description: `Autopay ${data.frequency.toLowerCase()} donation - ₹${data.amount}`,
                prefill: {
                    name: data.donorName,
                    email: data.donorEmail,
                    contact: data.donorPhone || "",
                },
                theme: { color: "#f59e0b" },
                handler: async (response: any) => {
                    console.log("Autopay subscription completed, verifying", response);
                    const verifyRes = await fetch("/api/autopay/verify-subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            subscriptionId: subscriptionData.subscriptionId,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        }),
                    });
                    const verifyData = await verifyRes.json();
                    console.log("Verification result", verifyData);

                    if (verifyData.success) {
                        toast.success("Autopay subscription activated! You will be charged on the scheduled date.");
                        setSuccess(true);
                    } else {
                        toast.error(
                            "Subscription verification failed. Please contact support."
                        );
                    }
                },
                modal: {
                    ondismiss: () => {
                        console.log("Razorpay modal dismissed");
                        setIsLoading(false);
                    }
                },
            });

            rzp.open();
        } catch (err) {
            console.error("Autopay flow error", err);
            const errorMessage =
                err instanceof Error ? err.message : "Something went wrong.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onInvalid = (formErrors: FieldErrors<AutopayFormData>) => {
        toast.error("Please fill all required fields correctly.");
        console.warn("Autopay form validation failed", formErrors);
    };

    const submitAutopay = handleSubmit(onSubmit, onInvalid);

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-12 text-center border border-white"
            >
                <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="font-serif text-4xl font-bold text-slate-800 mb-4 tracking-tight">
                    Subscription Activated!
                </h2>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    Your autopay subscription is now active. You will be charged ₹{watchedAmount} every{" "}
                    {watchedFrequency === "WEEKLY" ? "week" : watchedFrequency === "MONTHLY" ? "month" : "year"}.
                </p>
                <p className="text-slate-500 text-base mb-4">
                    A confirmation email has been sent to your registered email address.
                </p>
                <Button
                    onClick={() => window.location.reload()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                    <RotateCw className="w-4 h-4" />
                    Back to Donations
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            key="autopay-form"
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-12 border border-white/50 relative overflow-hidden"
        >
            {/* Decorative elements */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-100/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-50/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <RotateCw className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-slate-800">
                            Recurring Donation
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Support our cause with every payment cycle</p>
                    </div>
                </div>

                <form onSubmit={submitAutopay} className="space-y-8">
                    {/* Amount & Frequency Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label
                                htmlFor="amount-autopay"
                                className="block text-slate-700 font-semibold mb-3"
                            >
                                Monthly/Weekly/Yearly Amount *
                            </Label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-500 text-lg font-semibold">₹</span>
                                <Input
                                    id="amount-autopay"
                                    type="number"
                                    placeholder="500"
                                    min="100"
                                    step="1"
                                    {...register("amount", { valueAsNumber: true })}
                                    className="pl-8 h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="frequency" className="block text-slate-700 font-semibold mb-3">
                                Frequency *
                            </Label>
                            <Select
                                defaultValue="MONTHLY"
                                onValueChange={(value) => setValue("frequency", value as "WEEKLY" | "MONTHLY"|"YEARLY")}
                            >
                                <SelectTrigger id="frequency" className="h-12 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Donor Information */}
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-700 mb-4">Donor Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="donorName" className="block text-slate-700 font-medium mb-2">
                                    Full Name *
                                </Label>
                                <Input
                                    id="donorName"
                                    placeholder="John Doe"
                                    {...register("donorName")}
                                    className="h-10 rounded-lg border-slate-200"
                                />
                                {errors.donorName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.donorName.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="donorEmail" className="block text-slate-700 font-medium mb-2">
                                    Email *
                                </Label>
                                <Input
                                    id="donorEmail"
                                    type="email"
                                    placeholder="john@example.com"
                                    {...register("donorEmail")}
                                    className="h-10 rounded-lg border-slate-200"
                                />
                                {errors.donorEmail && (
                                    <p className="text-red-500 text-sm mt-1">{errors.donorEmail.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="donorPhone" className="block text-slate-700 font-medium mb-2">
                                    Phone (Optional)
                                </Label>
                                <Input
                                    id="donorPhone"
                                    placeholder="9876543210"
                                    {...register("donorPhone")}
                                    className="h-10 rounded-lg border-slate-200"
                                />
                                {errors.donorPhone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.donorPhone.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="donorPAN" className="block text-slate-700 font-medium mb-2">
                                    PAN (Optional)
                                </Label>
                                <Input
                                    id="donorPAN"
                                    placeholder="ABCDE1234F"
                                    {...register("donorPAN")}
                                    className="h-10 rounded-lg border-slate-200"
                                />
                                {errors.donorPAN && (
                                    <p className="text-red-500 text-sm mt-1">{errors.donorPAN.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Purpose & Message */}
                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-700 mb-4">Donation Details</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Label htmlFor="purpose" className="block text-slate-700 font-medium mb-2">
                                    Purpose (Optional)
                                </Label>
                                <Select defaultValue="" onValueChange={(value) => setValue("purpose", value)}>
                                    <SelectTrigger id="purpose" className="rounded-lg border-slate-200">
                                        <SelectValue placeholder="Select a purpose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {purposes.map((p) => (
                                            <SelectItem key={p} value={p}>
                                                {p}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="message" className="block text-slate-700 font-medium mb-2">
                                    Message (Optional)
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Share your message or why you support us..."
                                    rows={3}
                                    {...register("message")}
                                    className="rounded-lg border-slate-200 resize-none"
                                />
                                {errors.message && (
                                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <motion.div
                        layout
                        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50"
                    >
                        <p className="text-sm text-slate-600">
                            <span className="font-semibold text-amber-900">Subscription Summary:</span> You will be
                            charged{" "}
                            <span className="font-semibold text-amber-900">₹{watchedAmount || 500}</span> every{" "}
                            <span className="font-semibold text-amber-900">
                                {watchedFrequency === "WEEKLY" ? "week" : watchedFrequency === "MONTHLY" ? "month" : "yearly"}
                            </span>{" "}
                            until you cancel.
                        </p>
                    </motion.div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Heart className="w-4 h-4 mr-2 fill-current" />
                                {submitLabel}
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </motion.div>
    );
}
