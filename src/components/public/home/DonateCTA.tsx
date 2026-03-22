"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";

interface DonateCTAProps {
    settings: Record<string, string>;
}

export function DonateCTA({ settings }: DonateCTAProps) {
    const heading = settings.donate_cta_heading || "Make a Difference Today";
    const subtext = settings.donate_cta_subtext || "Every contribution, no matter how small, brings hope to someone in need.";
    const presetAmounts = (settings.donate_amounts || "500,1000,2000,5000").split(",");

    return (
        <section className="py-20 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-8 h-8 text-amber-400 fill-amber-400" />
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
                        {heading}
                    </h2>
                    <p className="text-blue-200 text-xl mb-8 max-w-xl mx-auto">{subtext}</p>

                    {/* Preset amounts */}
                    <div className="flex flex-wrap gap-3 justify-center mb-8">
                        {presetAmounts.map((amount) => (
                            <Link key={amount} href={`/donate?amount=${amount}`}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white/10 hover:bg-amber-400 border border-white/20 hover:border-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 text-lg"
                                >
                                    ₹{parseInt(amount).toLocaleString("en-IN")}
                                </motion.button>
                            </Link>
                        ))}
                        <Link href="/donate">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200"
                            >
                                Custom ₹
                            </motion.button>
                        </Link>
                    </div>

                    <Link href="/donate">
                        <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-6 text-lg shadow-xl shadow-amber-500/20">
                            <Heart className="w-5 h-5 mr-2 fill-white" />
                            Donate Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>

                    <p className="mt-4 text-sm text-blue-300">
                        Tax benefits under 80G of Income Tax Act · Secure payment via Razorpay
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
