"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap, HeartPulse, Users, Heart, Home, Leaf, BookOpen, Star } from "lucide-react";

interface CausesProps {
    settings: Record<string, string>;
}

const ICON_MAP: Record<string, React.ElementType> = {
    GraduationCap, HeartPulse, Users, Heart, Home, Leaf, BookOpen, Star,
};

export function CausesSection({ settings }: CausesProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const causes = [1, 2, 3].map((i) => ({
        icon: settings[`cause${i}_icon`] || "Heart",
        title: settings[`cause${i}_title`] || "",
        description: settings[`cause${i}_description`] || "",
    })).filter((c) => c.title);

    if (!causes.length) return null;

    const colors = [
        { bg: "bg-blue-50", icon: "text-blue-700", border: "border-blue-200", hover: "hover:border-blue-400" },
        { bg: "bg-rose-50", icon: "text-rose-600", border: "border-rose-200", hover: "hover:border-rose-400" },
        { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200", hover: "hover:border-emerald-400" },
    ];

    return (
        <section ref={ref} className="py-20 bg-slate-50">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-14"
                >
                    <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">What We Do</p>
                    <h2 className="font-serif text-4xl font-bold text-slate-900 mb-4">Our Causes</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        We focus on three core pillars that drive sustainable change in communities
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {causes.map((cause, idx) => {
                        const c = colors[idx % colors.length];
                        const IconComponent = ICON_MAP[cause.icon] || Heart;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: idx * 0.15 }}
                                className={`bg-white rounded-3xl p-8 border-2 ${c.border} ${c.hover} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group`}
                            >
                                <div className={`w-16 h-16 rounded-2xl ${c.bg} flex items-center justify-center mb-6`}>
                                    <IconComponent className={`w-8 h-8 ${c.icon}`} />
                                </div>
                                <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">{cause.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{cause.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
