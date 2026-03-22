"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { getInitials } from "@/lib/utils";

interface TestimonialsProps {
    settings: Record<string, string>;
}

export function TestimonialsSection({ settings }: TestimonialsProps) {
    const [current, setCurrent] = useState(0);

    const testimonials = [1, 2, 3].map((i) => ({
        name: settings[`testimonial${i}_name`] || "",
        designation: settings[`testimonial${i}_designation`] || "",
        quote: settings[`testimonial${i}_quote`] || "",
        image: settings[`testimonial${i}_image`] || "",
    })).filter((t) => t.name && t.quote);

    if (!testimonials.length) return null;

    const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
    const next = () => setCurrent((c) => (c + 1) % testimonials.length);
    const active = testimonials[current];

    return (
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
                    <h2 className="font-serif text-4xl font-bold text-slate-900">What People Say</h2>
                </motion.div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
                        >
                            <Quote className="w-12 h-12 text-blue-100 mx-auto mb-6" />
                            <p className="text-slate-700 text-xl md:text-2xl font-serif italic leading-relaxed mb-8">
                                &ldquo;{active.quote}&rdquo;
                            </p>

                            {/* Stars */}
                            <div className="flex justify-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                ))}
                            </div>

                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100">
                                    {active.image ? (
                                        <Image
                                            src={active.image}
                                            alt={active.name}
                                            width={64}
                                            height={64}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-blue-700 text-xl">
                                            {getInitials(active.name)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{active.name}</p>
                                    <p className="text-slate-500 text-sm">{active.designation}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    {testimonials.length > 1 && (
                        <div className="flex justify-center gap-4 mt-8 items-center">
                            <button
                                onClick={prev}
                                className="w-10 h-10 rounded-full border-2 border-blue-200 hover:border-blue-800 hover:bg-blue-50 flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-blue-800" />
                            </button>
                            <div className="flex gap-2">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrent(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-blue-800" : "bg-blue-200"}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={next}
                                className="w-10 h-10 rounded-full border-2 border-blue-200 hover:border-blue-800 hover:bg-blue-50 flex items-center justify-center transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-blue-800" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
