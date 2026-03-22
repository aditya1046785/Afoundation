"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Users, Calendar, IndianRupee, GraduationCap, HeartPulse, Target, Shield } from "lucide-react";

interface ImpactStatsProps {
    settings: Record<string, string>;
}

const ICON_MAP: Record<string, React.ElementType> = {
    Heart, Users, Calendar, IndianRupee, GraduationCap, HeartPulse, Target, Shield,
};

function StatCard({ number, label, icon, index }: { number: string; label: string; icon: string; index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const IconComponent = ICON_MAP[icon] || Heart;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow border border-slate-100 group hover:-translate-y-1 duration-300"
        >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <IconComponent className="w-8 h-8 text-blue-800" />
            </div>
            <p className="font-serif text-3xl font-bold text-slate-900 mb-1">{number}</p>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
        </motion.div>
    );
}

export function ImpactStats({ settings }: ImpactStatsProps) {
    const stats = [
        { number: settings.impact_stat1_number, label: settings.impact_stat1_label, icon: settings.impact_stat1_icon },
        { number: settings.impact_stat2_number, label: settings.impact_stat2_label, icon: settings.impact_stat2_icon },
        { number: settings.impact_stat3_number, label: settings.impact_stat3_label, icon: settings.impact_stat3_icon },
        { number: settings.impact_stat4_number, label: settings.impact_stat4_label, icon: settings.impact_stat4_icon },
    ].filter((s) => s.number && s.label);

    if (!stats.length) return null;

    return (
        <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <StatCard key={idx} index={idx} number={stat.number || ""} label={stat.label || ""} icon={stat.icon || "Heart"} />
                    ))}
                </div>
            </div>
        </section>
    );
}
