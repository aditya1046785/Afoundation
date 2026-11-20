"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donationSchema } from "@/lib/validations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Heart, Loader2, CheckCircle } from "lucide-react";
import type { z } from "zod";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";

interface DonateFormProps {
    presetAmounts: number[];
    purposes: string[];
}

type DonationFormData = z.input<typeof donationSchema>;

interface CreateOrderResponseData {
    orderId: string;
    amount: number;
    currency: string;
    donationId: string;
    receiptNumber: string;
}

export function DonateForm({ presetAmounts, purposes }: DonateFormProps) {
    const searchParams = useSearchParams();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DonationFormData>({
        resolver: zodResolver(donationSchema),
        defaultValues: { amount: 1000, donorName: "", donorEmail: "", donorPhone: "", donorPAN: "", purpose: "", message: "", referralCode: undefined },
    });

    const watchedAmount = watch("amount");
    const referralCode = searchParams.get("ref")?.trim() || "";
    const campaignId = searchParams.get("campaign")?.trim() || "";
    const campaignTitle = searchParams.get("campaignTitle")?.trim() || "";
    const customPurpose = searchParams.get("purpose")?.trim() || "";
    const campaignPurpose = campaignTitle ? `Crowdfunding - ${campaignTitle}` : "";
    const selectedPurpose = customPurpose || campaignPurpose;
    const purposeOptions = useMemo(() => {
        if (!selectedPurpose || purposes.includes(selectedPurpose)) {
            return purposes;
        }
        return [selectedPurpose, ...purposes];
    }, [selectedPurpose, purposes]);
    const prefillAmount = searchParams.get("amount") || "";
    const prefillName = searchParams.get("name")?.trim() || "";
    const prefillEmail = searchParams.get("email")?.trim() || "";
    const prefillPhone = searchParams.get("phone")?.trim() || "";
    const prefillPAN = searchParams.get("pan")?.trim() || "";

    useEffect(() => {
        setValue("referralCode", referralCode || undefined);
    }, [referralCode, setValue]);

    useEffect(() => {
        if (selectedPurpose) {
            setValue("purpose", selectedPurpose);
        }
    }, [selectedPurpose, setValue]);

    useEffect(() => {
        if (prefillName) setValue("donorName", prefillName);
        if (prefillEmail) setValue("donorEmail", prefillEmail);
        if (prefillPhone) setValue("donorPhone", prefillPhone);
        if (prefillPAN) setValue("donorPAN", prefillPAN);
    }, [prefillName, prefillEmail, prefillPhone, prefillPAN, setValue]);

    useEffect(() => {
        const amount = Number(prefillAmount);
        if (prefillAmount && Number.isFinite(amount) && amount >= 1) {
            setValue("amount", amount);
            setSelectedAmount(null);
        }
    }, [prefillAmount, setValue]);

    // Requirement 8: sessionStorage read/write try/catch me wrap karo
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("nirashray-quick-donation");
            if (!stored) return;
            sessionStorage.removeItem("nirashray-quick-donation");
            const donor: unknown = JSON.parse(stored);
            if (!donor || typeof donor !== "object") return;
            for (const field of ["donorName", "donorPhone", "donorEmail", "donorPAN"] as const) {
                const value = (donor as Record<string, unknown>)[field];
                if (typeof value === "string") setValue(field, value);
            }
        } catch (storageErr) {
            console.warn("Could not read quick-donation from sessionStorage:", storageErr);
        }
    }, [setValue]);

    const normalizeDonationPayload = (data: DonationFormData) => {
        const payload: Record<string, unknown> = {
            amount: data.amount,
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

        if (campaignId) {
            payload.donationType = "crowdfunding";
            payload.crowdfundingCampaignId = campaignId;
            if (campaignTitle) {
                payload.crowdfundingCampaignTitle = campaignTitle;
            }
        }

        return payload;
    };

    // Requirement 1 & 2: Discriminated-union payment state machine hook
    const { state, isSubmitting, startPayment, reset } = usePaymentFlow<
        DonationFormData,
        CreateOrderResponseData
    >({
        createOrder: async (data: DonationFormData) => {
            const payload = normalizeDonationPayload(data);
            const res = await fetch("/api/donations/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseData = await res.json();
            const { success: ok, data: orderData, error } = responseData;
            if (!ok || !orderData) {
                throw new Error(error || "Failed to create order");
            }

            return {
                orderId: orderData.orderId,
                razorpayOptions: {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: "INR",
                    name: "Nirashray Foundation",
                    description: data.purpose || "Donation",
                    order_id: orderData.orderId,
                    prefill: {
                        name: data.donorName,
                        email: data.donorEmail,
                        contact: data.donorPhone || "",
                    },
                    theme: { color: "#ab3600" },
                },
                context: orderData,
            };
        },
        verifyPayment: async (response) => {
            const verifyRes = await fetch("/api/donations/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
                throw new Error(verifyData.error || "Payment verification failed. Please contact support.");
            }

            return {
                paymentId: (response.razorpay_payment_id || verifyData?.data?.paymentId) as string,
                receiptNumber: verifyData?.data?.receiptNumber as string | undefined,
                data: verifyData,
            };
        },
        onSuccess: (result) => {
            toast.success("Thank you for your donation! Preparing your receipt download...");
            if (result.receiptNumber && result.paymentId) {
                const receiptUrl = `/api/receipts/${encodeURIComponent(result.receiptNumber)}/pdf?paymentId=${encodeURIComponent(result.paymentId)}`;
                setTimeout(() => {
                    window.location.assign(receiptUrl);
                }, 900);
            }
        },
    });

    const onSubmit = async (data: DonationFormData) => {
        await startPayment(data);
    };

    const onInvalid = (formErrors: FieldErrors<DonationFormData>) => {
        toast.error("Please fill all required fields correctly.");
        console.warn("Donate form validation failed", formErrors);
    };

    const submitDonation = handleSubmit(onSubmit, onInvalid);

    // Requirement 9: UI me sirf status dekh ke render karo
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
                <h2 className="font-serif text-4xl font-bold text-brand-neutral-800 mb-4 tracking-tight">Thank You!</h2>
                <p className="text-brand-neutral-500 text-lg mb-10 font-normal leading-relaxed max-w-md mx-auto">
                    Your generous donation has been securely received. An official 80G receipt has been sent directly to your email address.
                </p>
                <Button
                    onClick={() => reset()}
                    variant="outline"
                    className="rounded-full px-8 py-6 text-base font-medium text-brand-neutral-700 border-2 border-brand-neutral-200 hover:border-brand-neutral-800 hover:bg-transparent transition-all duration-300 shadow-none"
                >
                    Make Another Donation
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-white relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-neutral-800 tracking-tight">Make a Donation</h2>
                <span className="text-brand-neutral-400 text-sm tracking-widest uppercase font-medium">Secure</span>
            </div>

            <form onSubmit={(event) => {
                event.preventDefault();
                submitDonation();
            }} className="space-y-8 relative z-10">
                {referralCode && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Referral Applied</p>
                        <p className="text-sm text-emerald-900 mt-1">This donation is linked to member code: <span className="font-bold">{referralCode}</span></p>
                    </div>
                )}

                {campaignId && campaignTitle && (
                    <div className="bg-brand-accent-50 border border-brand-accent-200 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-brand-accent-700 uppercase tracking-widest">Crowdfunding Campaign</p>
                        <p className="text-sm text-brand-accent-900 mt-1">Your donation is linked to: <span className="font-bold">{campaignTitle}</span></p>
                    </div>
                )}

                {/* Preset Amounts */}
                <div className="bg-brand-neutral-50/50 p-6 rounded-[1.5rem] border border-brand-neutral-100">
                    <Label className="text-sm font-semibold text-brand-neutral-700 mb-4 block tracking-wide">SELECT AMOUNT (₹)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                        {presetAmounts.map((amount) => (
                            <motion.button
                                key={amount}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedAmount(amount);
                                    setValue("amount", amount);
                                }}
                                className={`py-4 px-2 rounded-2xl border-2 font-bold text-base transition-all duration-300 shadow-sm ${watchedAmount === amount && selectedAmount === amount
                                    ? "bg-brand-neutral-800 text-white border-brand-neutral-800 shadow-brand-neutral-800/10"
                                    : "bg-white text-brand-neutral-700 border-brand-neutral-200 hover:border-brand-neutral-400"
                                    }`}
                            >
                                ₹{amount.toLocaleString("en-IN")}
                            </motion.button>
                        ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neutral-400 font-bold text-lg">₹</span>
                        <Input
                            {...register("amount", { valueAsNumber: true })}
                            type="number"
                            placeholder="Or enter custom amount"
                            className="pl-9 h-14 rounded-2xl bg-white border-brand-neutral-200 text-lg font-bold text-brand-neutral-800 focus-visible:ring-brand-accent-500 shadow-sm"
                            onChange={(e) => {
                                setSelectedAmount(null);
                                setValue("amount", parseFloat(e.target.value) || 0);
                            }}
                        />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-2 font-medium">{errors.amount.message}</p>}
                </div>

                {/* Purpose */}
                <div>
                    <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Cause / Purpose</Label>
                    <Select onValueChange={(val) => setValue("purpose", val)} value={watch("purpose") || ""}>
                        <SelectTrigger className="h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 text-brand-neutral-700 focus:ring-brand-accent-500">
                            <SelectValue placeholder="Select a cause (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {purposeOptions.map((p) => (
                                <SelectItem key={p} value={p}>
                                    {p}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Donor Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Full Name *</Label>
                        <Input {...register("donorName")} placeholder="Aarav Sharma" className="h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500" />
                        {errors.donorName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.donorName.message}</p>}
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Email Address *</Label>
                        <Input {...register("donorEmail")} type="email" placeholder="aarav@example.com" className="h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500" />
                        {errors.donorEmail && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.donorEmail.message}</p>}
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Phone Number
                        <span className="text-brand-neutral-400 font-normal ml-1">(Optional)</span>
                        </Label>
                        <Input {...register("donorPhone")} type="tel" placeholder="10-digit mobile" className="h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500" />
                        {errors.donorPhone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.donorPhone.message}</p>}
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">PAN Card (For 80G)</Label>
                        <Input {...register("donorPAN")} placeholder="ABCDE1234F" className="uppercase h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500" />
                    </div>
                    <div className="sm:col-span-2">
                        <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Personal Message (Optional)</Label>
                        <Textarea {...register("message")} placeholder="Add a note to your donation..." rows={3} className="rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500 resize-none" />
                    </div>
                </div>

                {state.status === "error" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <p className="text-red-600 text-sm font-medium">{state.message}</p>
                    </div>
                )}

                {/* Requirement 4: Submit button disabled sirf tab jab status !== 'idle' aur !== 'error' */}
                <div className="pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            submitDonation();
                        }}
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 bg-brand-neutral-900 hover:bg-brand-neutral-800 text-white rounded-2xl py-8 text-xl font-bold shadow-xl shadow-brand-neutral-900/10 transition-all duration-300 hover:scale-[1.02] group cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin text-brand-accent-500" />
                                {state.status === "creating"
                                    ? "Preparing Payment..."
                                    : state.status === "verifying"
                                        ? "Verifying Payment..."
                                        : "Processing Payment..."}
                            </>
                        ) : (
                            <>
                                Donate ₹{(watchedAmount || 0).toLocaleString("en-IN")}
                                <Heart className="w-5 h-5 ml-3 fill-brand-accent-500 text-brand-accent-500 transition-transform group-hover:scale-110" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs font-medium text-brand-neutral-400 mt-6 tracking-wide">
                        100% SECURE PAYMENT POWERED BY RAZORPAY.
                    </p>
                </div>
            </form>
        </div>
    );
}
