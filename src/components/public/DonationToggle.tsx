"use client";

import { motion } from "framer-motion";

interface DonationToggleProps {
    isDonationType: "one-time" | "autopay";
    setIsDonationType: (type: "one-time" | "autopay") => void;
}

export function DonationToggle({ isDonationType, setIsDonationType }: DonationToggleProps) {
    return (
        <div className="flex justify-center mb-12">
            <div className="relative bg-gradient-to-r from-amber-50 to-transparent rounded-full p-1.5 shadow-md border border-amber-200/50 backdrop-blur-sm inline-block">
                {/* Animated background */}
                <motion.div
                    layout
                    layoutId="donation-toggle-bg"
                    className="absolute inset-1.5 bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                {/* Toggle buttons */}
                <div className="relative flex gap-2">
                    {/* One-Time Button */}
                    <button
                        onClick={() => setIsDonationType("one-time")}
                        className={`relative px-8 py-3 rounded-full font-medium transition-colors duration-200 whitespace-nowrap ${
                            isDonationType === "one-time"
                                ? "text-amber-900"
                                : "text-slate-600 hover:text-slate-800"
                        }`}
                    >
                        <motion.span
                            initial={false}
                            animate={{
                                opacity: isDonationType === "one-time" ? 1 : 0.6,
                            }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            One-Time
                        </motion.span>
                    </button>

                    {/* Autopay Button */}
                    <button
                        onClick={() => setIsDonationType("autopay")}
                        className={`relative px-8 py-3 rounded-full font-medium transition-colors duration-200 whitespace-nowrap ${
                            isDonationType === "autopay"
                                ? "text-amber-900"
                                : "text-slate-600 hover:text-slate-800"
                        }`}
                    >
                        <motion.span
                            initial={false}
                            animate={{
                                opacity: isDonationType === "autopay" ? 1 : 0.6,
                            }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Autopay
                        </motion.span>
                    </button>
                </div>
            </div>
        </div>
    );
}
