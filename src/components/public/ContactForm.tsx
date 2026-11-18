"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { z } from "zod";

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormData) => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) {
                setSuccess(true);
                toast.success("Message sent successfully!");
                reset();
            } else {
                toast.error(result.error || "Failed to send message.");
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 backdrop-blur-md rounded-2xl border border-white p-12 text-center"
            >
                <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="font-serif text-4xl font-bold text-brand-neutral-800 mb-4 tracking-tight">Thank You!</h2>
                <p className="text-brand-neutral-500 text-lg mb-10 font-normal leading-relaxed max-w-md mx-auto">
                    Your message has been securely sent. A member of our team will get back to you shortly.
                </p>
                <Button onClick={() => setSuccess(false)} variant="outline" className="rounded-full px-8 py-6 text-base font-medium text-brand-neutral-700 border-2 border-brand-neutral-200 hover:border-brand-neutral-800 hover:bg-transparent transition-all duration-300 shadow-none">
                    Send Another Message
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="bg-transparent w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                        <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Full Name *</Label>
                        <Input {...register("name")} placeholder="Your name" className="h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500 shadow-sm" />
                        {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Email Address *</Label>
                        <Input {...register("email")} type="email" placeholder="your@email.com" className="h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500 shadow-sm" />
                        {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                    </div>
                </div>
                <div>
                    <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Phone Number (Optional)</Label>
                    <Input {...register("phone")} type="tel" placeholder="10-digit mobile" className="h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500 shadow-sm" />
                </div>
                <div>
                    <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Subject *</Label>
                    <Input {...register("subject")} placeholder="How can we help?" className="h-12 rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500 shadow-sm" />
                    {errors.subject && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.subject.message}</p>}
                </div>
                <div>
                    <Label className="text-xs font-semibold text-brand-neutral-500 mb-2 block tracking-widest uppercase">Message *</Label>
                    <Textarea {...register("message")} rows={5} placeholder="Type your message here..." className="rounded-xl bg-brand-neutral-50/50 border-brand-neutral-200 focus-visible:ring-brand-accent-500 resize-none shadow-sm" />
                    {errors.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.message.message}</p>}
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full bg-brand-neutral-900 hover:bg-brand-neutral-800 text-white rounded-2xl py-8 text-xl font-bold shadow-xl shadow-brand-neutral-900/10 transition-all duration-300 hover:scale-[1.02] group">
                        {isLoading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin text-brand-accent-500" /> Sending...</> : <><Send className="w-5 h-5 mr-3 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" /> Send Message</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}
