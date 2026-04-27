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

interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string | undefined;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: { color: string };
    handler: (response: RazorpayPaymentResponse) => Promise<void>;
    modal: { ondismiss: () => void };
}

interface RazorpayInstance {
    open: () => void;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface DonateFormProps {
    presetAmounts: number[];
    purposes: string[];
}

type DonationFormData = z.input<typeof donationSchema>;

export function DonateForm({ presetAmounts, purposes }: DonateFormProps) {
    const searchParams = useSearchParams();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DonationFormData>({
        resolver: zodResolver(donationSchema),
        defaultValues: { amount: 1000, donorName: "", donorEmail: "", donorPhone: "", donorPAN: "", purpose: "", message: "", referralCode: undefined },
    });

    const watchedAmount = watch("amount");
    const watchedPurpose = watch("purpose");
    const referralCode = searchParams.get("ref")?.trim() || "";
    const campaignId = searchParams.get("campaign")?.trim() || "";
    const campaignTitle = searchParams.get("campaignTitle")?.trim() || "";
    const campaignPurpose = campaignTitle ? `Crowdfunding - ${campaignTitle}` : "";
    const purposeOptions = useMemo(() => {
        if (!campaignPurpose || purposes.includes(campaignPurpose)) {
            return purposes;
        }
        return [campaignPurpose, ...purposes];
    }, [campaignPurpose, purposes]);
    const prefillName = searchParams.get("name")?.trim() || "";
    const prefillEmail = searchParams.get("email")?.trim() || "";
    const prefillPhone = searchParams.get("phone")?.trim() || "";
    const prefillPAN = searchParams.get("pan")?.trim() || "";

    useEffect(() => {
        setValue("referralCode", referralCode || undefined);
    }, [referralCode, setValue]);

    useEffect(() => {
        if (campaignPurpose) {
            setValue("purpose", campaignPurpose);
        }
    }, [campaignPurpose, setValue]);

    useEffect(() => {
        if (prefillName) setValue("donorName", prefillName);
        if (prefillEmail) setValue("donorEmail", prefillEmail);
        if (prefillPhone) setValue("donorPhone", prefillPhone);
        if (prefillPAN) setValue("donorPAN", prefillPAN);
    }, [prefillName, prefillEmail, prefillPhone, prefillPAN, setValue]);

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

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = resolve;
            document.body.appendChild(script);
        });
    };

    const onSubmit = async (data: DonationFormData) => {
        try {
            console.log("Donate form submitted", data);
            setIsLoading(true);
            console.log("Loading Razorpay script");
            
            await loadRazorpay();
            console.log("Razorpay script loaded");

            // Create order
            console.log("Creating order");
            const payload = normalizeDonationPayload(data);
            console.log("Create-order payload", payload);

            const res = await fetch("/api/donations/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            
            console.log("Create-order response status", res.status);
            const responseData = await res.json();
            console.log("Create-order response data", responseData);
            
            const { success, data: orderData, error } = responseData;
            if (!success) {
                throw new Error(error || "Failed to create order");
            }

            console.log("Order created", orderData);

            // Open Razorpay checkout
            console.log("Opening Razorpay checkout");
            const rzp = new window.Razorpay({
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
                theme: { color: "#f59e0b" }, // Amber 500
                handler: async (response: RazorpayPaymentResponse) => {
                    console.log("Payment completed, verifying", response);
                    const verifyRes = await fetch("/api/donations/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response),
                    });
                    const verifyData = await verifyRes.json();
                    console.log("Verification result", verifyData);
                    
                    if (verifyData.success) {
                        const receiptNumber = verifyData?.data?.receiptNumber as string | undefined;
                        const paymentId = verifyData?.data?.paymentId as string | undefined;

                        toast.success("Thank you for your donation! Preparing your receipt download...");

                        if (receiptNumber && paymentId) {
                            const receiptUrl = `/api/receipts/${encodeURIComponent(receiptNumber)}/pdf?paymentId=${encodeURIComponent(paymentId)}`;
                            setTimeout(() => {
                                window.location.assign(receiptUrl);
                            }, 900);
                        } else {
                            setSuccess(true);
                        }
                    } else {
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                modal: { ondismiss: () => {
                    console.log("Razorpay modal dismissed by user");
                    setIsLoading(false);
                } },
            });
            rzp.open();
        } catch (err) {
            console.error("Donate flow error", err);
            const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
            console.error("Error message", errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onInvalid = (formErrors: FieldErrors<DonationFormData>) => {
        toast.error("Please fill all required fields correctly.");
        console.warn("Donate form validation failed", formErrors);
    };

    const submitDonation = handleSubmit(onSubmit, onInvalid);

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
                <h2 className="font-serif text-4xl font-bold text-slate-800 mb-4 tracking-tight">Thank You!</h2>
                <p className="text-slate-500 text-lg mb-10 font-light leading-relaxed max-w-md mx-auto">
                    Your generous donation has been securely received. An official 80G receipt has been sent directly to your email address.
                </p>
                <Button onClick={() => setSuccess(false)} variant="outline" className="rounded-full px-8 py-6 text-base font-medium text-slate-700 border-2 border-slate-200 hover:border-slate-800 hover:bg-transparent transition-all duration-300 shadow-none">
                    Make Another Donation
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-white relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Make a Donation</h2>
                <span className="text-slate-400 text-sm tracking-widest uppercase font-medium">Secure</span>
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
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest">Crowdfunding Campaign</p>
                        <p className="text-sm text-amber-900 mt-1">Your donation is linked to: <span className="font-bold">{campaignTitle}</span></p>
                    </div>
                )}

                {/* Preset Amounts */}
                <div className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                    <Label className="text-sm font-semibold text-slate-700 mb-4 block tracking-wide">SELECT AMOUNT (₹)</Label>
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
                                        ? "border-amber-500 bg-amber-50 text-amber-900 shadow-[0_4px_14px_rgba(245,158,11,0.2)]"
                                        : "border-white bg-white text-slate-600 hover:border-amber-300 hover:text-amber-800"
                                    }`}
                            >
                                ₹{amount.toLocaleString("en-IN")}
                            </motion.button>
                        ))}
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                        <Input
                            type="number"
                            placeholder="Enter custom amount"
                            min={100}
                            className="bg-white border-white shadow-sm pl-8 h-14 rounded-2xl text-lg font-medium focus-visible:ring-amber-500"
                            {...register("amount", { valueAsNumber: true })}
                            onChange={(e) => {
                                setSelectedAmount(null);
                                setValue("amount", parseFloat(e.target.value));
                            }}
                        />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-2 font-medium ml-2">{errors.amount.message}</p>}
                </div>

                {/* Purpose */}
                <div className="pl-2">
                    <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase">Donation Purpose</Label>
                    <Select value={watchedPurpose || undefined} onValueChange={(val) => setValue("purpose", val)}>
                        <SelectTrigger className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-amber-500">
                            <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl font-medium">
                            {purposeOptions.map((p) => <SelectItem key={p} value={p} className="focus:bg-amber-50 focus:text-amber-900">{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Donor Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 pl-2 pr-2">
                    <div>
                        <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase">Full Name *</Label>
                        <Input {...register("donorName")} placeholder="Your name" className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-amber-500" />
                        {errors.donorName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.donorName.message}</p>}
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase">Email Address *</Label>
                        <Input {...register("donorEmail")} type="email" placeholder="your@email.com" className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-amber-500" />
                        {errors.donorEmail && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.donorEmail.message}</p>}
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase">Phone Number
                        <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                        </Label>
                        <Input {...register("donorPhone")} type="tel" placeholder="10-digit mobile" className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-amber-500" />
                        {errors.donorPhone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.donorPhone.message}</p>}
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase">PAN Card (For 80G)</Label>
                        <Input {...register("donorPAN")} placeholder="ABCDE1234F" className="uppercase h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-amber-500" />
                    </div>
                    <div className="sm:col-span-2">
                        <Label className="text-xs font-semibold text-slate-500 mb-2 block tracking-widest uppercase">Personal Message (Optional)</Label>
                        <Textarea {...register("message")} placeholder="Add a note to your donation..." rows={3} className="rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-amber-500 resize-none" />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            console.log("Donate button clicked");
                            submitDonation();
                        }}
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-8 text-xl font-bold shadow-xl shadow-slate-900/10 transition-all duration-300 hover:scale-[1.02] group cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 mr-3 animate-spin text-amber-500" /> Securely Processing...</>
                        ) : (
                            <>
                                Donate ₹{(watchedAmount || 0).toLocaleString("en-IN")}
                                <Heart className="w-5 h-5 ml-3 fill-amber-500 text-amber-500 transition-transform group-hover:scale-110" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs font-medium text-slate-400 mt-6 tracking-wide">
                        100% SECURE PAYMENT POWERED BY RAZORPAY. 
                    </p>
                </div>
            </form>
        </div>
    );
}
