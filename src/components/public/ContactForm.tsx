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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-10 text-center"
            >
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-3">Thank You!</h2>
                <p className="text-slate-600 mb-6">Your message has been sent. We&apos;ll get back to you soon.</p>
                <Button onClick={() => setSuccess(false)} className="bg-blue-800 hover:bg-blue-900 text-white">
                    Send Another Message
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Full Name *</Label>
                        <Input {...register("name")} placeholder="Your name" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Label>Email *</Label>
                        <Input {...register("email")} type="email" placeholder="your@email.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                </div>
                <div>
                    <Label>Phone (optional)</Label>
                    <Input {...register("phone")} type="tel" placeholder="10-digit mobile" />
                </div>
                <div>
                    <Label>Subject *</Label>
                    <Input {...register("subject")} placeholder="How can we help?" />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                    <Label>Message *</Label>
                    <Textarea {...register("message")} rows={5} placeholder="Your message..." />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading} className="bg-blue-800 hover:bg-blue-900 text-white w-full py-3">
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                </Button>
            </form>
        </div>
    );
}
