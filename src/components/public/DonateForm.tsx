"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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

declare global {
    interface Window {
        Razorpay: unknown;
    }
}

interface DonateFormProps {
    presetAmounts: number[];
    purposes: string[];
}

type DonationFormData = z.input<typeof donationSchema>;

export function DonateForm({ presetAmounts, purposes }: DonateFormProps) {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DonationFormData>({
        resolver: zodResolver(donationSchema) as any,
        defaultValues: { amount: 1000, donorName: "", donorEmail: "", donorPhone: "", donorPAN: "", purpose: "", message: "" },
    });

    const watchedAmount = watch("amount");

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
            setIsLoading(true);
            await loadRazorpay();

            // Create order
            const res = await fetch("/api/donations/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const { success, data: orderData, error } = await res.json();
            if (!success) throw new Error(error);

            // Open Razorpay checkout
            const rzp = new (window.Razorpay as any)({
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
                theme: { color: "#1E40AF" },
                handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
                    const verifyRes = await fetch("/api/donations/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        setSuccess(true);
                        toast.success(`Thank you! Receipt: ${verifyData.data.receiptNumber}`);
                    } else {
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                modal: { ondismiss: () => setIsLoading(false) },
            });
            rzp.open();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-10 text-center"
            >
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-900 mb-3">Thank You!</h2>
                <p className="text-slate-600 mb-6">
                    Your donation has been received. A receipt has been sent to your email.
                </p>
                <Button onClick={() => setSuccess(false)} className="bg-blue-800 hover:bg-blue-900 text-white">
                    Make Another Donation
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Make a Donation</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Preset Amounts */}
                <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">Select Amount (₹)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                        {presetAmounts.map((amount) => (
                            <motion.button
                                key={amount}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setSelectedAmount(amount);
                                    setValue("amount", amount);
                                }}
                                className={`py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all ${watchedAmount === amount && selectedAmount === amount
                                    ? "border-blue-800 bg-blue-50 text-blue-800"
                                    : "border-slate-200 text-slate-600 hover:border-blue-300"
                                    }`}
                            >
                                ₹{amount.toLocaleString("en-IN")}
                            </motion.button>
                        ))}
                    </div>
                    <Input
                        type="number"
                        placeholder="Or enter custom amount"
                        min={100}
                        className="mt-2"
                        {...register("amount", { valueAsNumber: true })}
                        onChange={(e) => {
                            setSelectedAmount(null);
                            setValue("amount", parseFloat(e.target.value));
                        }}
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>

                {/* Purpose */}
                <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1 block">Donation Purpose</Label>
                    <Select onValueChange={(val) => setValue("purpose", val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                            {purposes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Donor Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-700 mb-1 block">Full Name *</Label>
                        <Input {...register("donorName")} placeholder="Your name" />
                        {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName.message}</p>}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-700 mb-1 block">Email *</Label>
                        <Input {...register("donorEmail")} type="email" placeholder="your@email.com" />
                        {errors.donorEmail && <p className="text-red-500 text-xs mt-1">{errors.donorEmail.message}</p>}
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-700 mb-1 block">Phone</Label>
                        <Input {...register("donorPhone")} type="tel" placeholder="10-digit mobile" />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-700 mb-1 block">PAN Card (for 80G)</Label>
                        <Input {...register("donorPAN")} placeholder="ABCDE1234F" className="uppercase" />
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1 block">Message (optional)</Label>
                    <Textarea {...register("message")} placeholder="Any message..." rows={3} />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 text-lg"
                >
                    {isLoading ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                    ) : (
                        <><Heart className="w-5 h-5 mr-2 fill-white" /> Donate ₹{(watchedAmount || 0).toLocaleString("en-IN")}</>
                    )}
                </Button>

                <p className="text-center text-xs text-slate-400">
                    Secure payment powered by Razorpay. Your payment info is never stored on our servers.
                </p>
            </form>
        </div>
    );
}
