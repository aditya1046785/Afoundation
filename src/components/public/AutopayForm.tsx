"use client";

import { useEffect } from "react";
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
import { usePaymentFlow } from "@/hooks/usePaymentFlow";

interface AutopayFormProps {
    purposes: string[];
}

type AutopayFormData = z.input<typeof autopaySchema>;

interface CreateSubscriptionResponseData {
    subscriptionId: string;
    razorpaySubscriptionId: string;
    amount: number;
    frequency: string;
}

export function AutopayForm({ purposes }: AutopayFormProps) {
    const searchParams = useSearchParams();

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

    // Requirement 1 & 2: usePaymentFlow hook
    const { state, isSubmitting, startPayment, reset } = usePaymentFlow<
        AutopayFormData,
        CreateSubscriptionResponseData
    >({
        createOrder: async (data: AutopayFormData) => {
            const payload = normalizeAutopayPayload(data);
            const res = await fetch("/api/autopay/create-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseData = await res.json();
            const { success: ok, data: subscriptionData, error } = responseData;
            if (!ok || !subscriptionData) {
                throw new Error(error || "Failed to create autopay subscription");
            }

            return {
                orderId: subscriptionData.razorpaySubscriptionId,
                razorpayOptions: {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    subscription_id: subscriptionData.razorpaySubscriptionId,
                    name: "Nirashray Foundation",
                    description: `Autopay ${data.frequency.toLowerCase()} donation - ₹${data.amount}`,
                    prefill: {
                        name: data.donorName,
                        email: data.donorEmail,
                        contact: data.donorPhone || "",
                    },
                    theme: { color: "#ab3600" },
                },
                context: subscriptionData,
            };
        },
        verifyPayment: async (response, context) => {
            const verifyRes = await fetch("/api/autopay/verify-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriptionId: context?.subscriptionId,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
                throw new Error(
                    verifyData.error || "Subscription verification failed. Please contact support."
                );
            }
            return {
                paymentId: response.razorpay_payment_id,
                data: verifyData,
            };
        },
        onSuccess: () => {
            toast.success("Autopay subscription activated! You will be charged on the scheduled date.");
        },
    });

    const onSubmit = async (data: AutopayFormData) => {
        await startPayment(data);
    };

    const onInvalid = (formErrors: FieldErrors<AutopayFormData>) => {
        toast.error("Please fill all required fields correctly.");
        console.warn("Autopay form validation failed", formErrors);
    };

    const submitAutopay = handleSubmit(onSubmit, onInvalid);

    // Requirement 7 & 9: UI me sirf status dekh ke render karo, window.location.reload() hatakar RESET button do
    if (state.status === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-12 text-center border border-white"
            >
                <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="font-serif text-4xl font-bold text-brand-neutral-800 mb-4 tracking-tight">
                    Subscription Activated!
                </h2>
                <p className="text-brand-neutral-600 text-lg mb-8 leading-relaxed">
                    Your autopay subscription is now active. You will be charged ₹{watchedAmount} every{" "}
                    {watchedFrequency === "WEEKLY" ? "week" : watchedFrequency === "MONTHLY" ? "month" : "year"}.
                </p>
                <p className="text-brand-neutral-500 text-base mb-8">
                    A confirmation email has been sent to your registered email address.
                </p>
                <Button
                    onClick={() => reset()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                    <RotateCw className="w-4 h-4" />
                    Set Up Another Subscription
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="bg-white rounded-2xl shadow-xl border border-brand-neutral-100 p-8 md:p-10">
                {referralCode && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <p className="text-sm text-emerald-800 font-medium">
                            <span className="font-semibold">Referral Applied:</span> {referralCode}
                        </p>
                    </div>
                )}

                <form onSubmit={(e) => {
                    e.preventDefault();
                    submitAutopay();
                }} className="space-y-6">
                    {/* Frequency Selection */}
                    <div>
                        <Label className="text-brand-neutral-700 font-semibold mb-3 block">
                            Donation Frequency *
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                            {(["WEEKLY", "MONTHLY", "YEARLY"] as const).map((freq) => (
                                <button
                                    key={freq}
                                    type="button"
                                    onClick={() => setValue("frequency", freq)}
                                    className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${watchedFrequency === freq
                                        ? "border-brand-accent-500 bg-brand-accent-50 text-brand-accent-700 font-semibold"
                                        : "border-brand-neutral-200 bg-white text-brand-neutral-600 hover:border-brand-neutral-300"
                                        }`}
                                >
                                    {freq === "WEEKLY" ? "Weekly" : freq === "MONTHLY" ? "Monthly" : "Yearly"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount Selection */}
                    <div>
                        <Label htmlFor="amount" className="text-brand-neutral-700 font-semibold mb-2 block">
                            Amount (₹) *
                        </Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neutral-400 font-bold text-lg">
                                ₹
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                className="pl-8 text-lg font-semibold h-12 rounded-xl border-brand-neutral-200 focus:border-brand-accent-500"
                                {...register("amount", { valueAsNumber: true })}
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Purpose Selection */}
                    <div>
                        <Label htmlFor="purpose" className="text-brand-neutral-700 font-semibold mb-2 block">
                            Cause / Purpose
                        </Label>
                        <Select
                            value={watch("purpose") || ""}
                            onValueChange={(value) => setValue("purpose", value)}
                        >
                            <SelectTrigger className="h-12 rounded-xl border-brand-neutral-200">
                                <SelectValue placeholder="Select a cause (Optional)" />
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

                    {/* Donor Details */}
                    <div className="pt-2 border-t border-brand-neutral-100">
                        <h3 className="text-sm font-semibold text-brand-neutral-800 mb-4 uppercase tracking-wider">
                            Donor Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="donorName" className="text-brand-neutral-700 text-sm mb-1 block">
                                    Full Name *
                                </Label>
                                <Input
                                    id="donorName"
                                    placeholder="Enter your full name"
                                    {...register("donorName")}
                                    className="h-11 rounded-lg border-brand-neutral-200"
                                />
                                {errors.donorName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.donorName.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="donorEmail" className="text-brand-neutral-700 text-sm mb-1 block">
                                        Email Address *
                                    </Label>
                                    <Input
                                        id="donorEmail"
                                        type="email"
                                        placeholder="your@email.com"
                                        {...register("donorEmail")}
                                        className="h-11 rounded-lg border-brand-neutral-200"
                                    />
                                    {errors.donorEmail && (
                                        <p className="text-red-500 text-sm mt-1">{errors.donorEmail.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="donorPhone" className="text-brand-neutral-700 text-sm mb-1 block">
                                        Phone Number (Optional)
                                    </Label>
                                    <Input
                                        id="donorPhone"
                                        placeholder="10-digit mobile number"
                                        {...register("donorPhone")}
                                        className="h-11 rounded-lg border-brand-neutral-200"
                                    />
                                    {errors.donorPhone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.donorPhone.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="donorPAN" className="text-brand-neutral-700 text-sm mb-1 block">
                                    PAN Card (Optional, for 80G tax benefit)
                                </Label>
                                <Input
                                    id="donorPAN"
                                    placeholder="ABCDE1234F"
                                    {...register("donorPAN")}
                                    className="h-11 rounded-lg border-brand-neutral-200 uppercase"
                                />
                                {errors.donorPAN && (
                                    <p className="text-red-500 text-sm mt-1">{errors.donorPAN.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="message" className="text-brand-neutral-700 text-sm mb-1 block">
                                    Message (Optional)
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Leave a message of encouragement..."
                                    rows={3}
                                    {...register("message")}
                                    className="rounded-lg border-brand-neutral-200 resize-none"
                                />
                                {errors.message && (
                                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {state.status === "error" && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                            <p className="text-sm text-red-600 font-medium">{state.message}</p>
                        </div>
                    )}

                    {/* Summary */}
                    <motion.div
                        layout
                        className="p-4 bg-gradient-to-r from-brand-accent-50 to-orange-50 rounded-xl border border-brand-accent-200/50"
                    >
                        <p className="text-sm text-brand-neutral-600">
                            <span className="font-semibold text-brand-accent-900">Subscription Summary:</span> You will be
                            charged{" "}
                            <span className="font-semibold text-brand-accent-900">₹{watchedAmount || 500}</span> every{" "}
                            <span className="font-semibold text-brand-accent-900">
                                {watchedFrequency === "WEEKLY" ? "week" : watchedFrequency === "MONTHLY" ? "month" : "yearly"}
                            </span>{" "}
                            until you cancel.
                        </p>
                    </motion.div>

                    {/* Requirement 4: Submit Button disabled sirf tab jab status !== 'idle' aur !== 'error' */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-accent-500 to-orange-500 hover:from-brand-accent-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {state.status === "creating"
                                    ? "Setting Up Subscription..."
                                    : state.status === "verifying"
                                        ? "Verifying Subscription..."
                                        : "Processing..."}
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
