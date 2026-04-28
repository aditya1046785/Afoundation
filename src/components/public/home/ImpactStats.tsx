"use client";

import { Heart, Users, Calendar, IndianRupee, GraduationCap, HeartPulse, Target, Shield } from "lucide-react";

interface ImpactStatsProps {
    settings: Record<string, string>;
}

const ICON_MAP: Record<string, React.ElementType> = {
    Heart, Users, Calendar, IndianRupee, GraduationCap, HeartPulse, Target, Shield,
};

function StatCard({ number, label, icon }: { number: string; label: string; icon: string }) {
    const IconComponent = ICON_MAP[icon] || Heart;

    return (
        <div className="flex flex-col items-center text-center p-8 relative group">
            {/* Artistic border line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-amber-300 transition-all duration-500 group-hover:w-full group-hover:bg-amber-400" />
            
            <div className="w-16 h-16 rounded-full bg-[#fbfaf8] border border-amber-100/50 flex items-center justify-center mb-6 shadow-sm group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors duration-500">
                <IconComponent className="w-6 h-6 text-amber-500" />
            </div>
            
            <p className="font-serif text-5xl lg:text-6xl font-bold text-slate-800 mb-3 tracking-tighter">{number}</p>
            <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{label}</p>
        </div>
    );
}

export function ImpactStats({ settings }: ImpactStatsProps) {
    const statsConfig = [
        { number: settings.impact_stat1_number, label: settings.impact_stat1_label, icon: settings.impact_stat1_icon },
        { number: settings.impact_stat2_number, label: settings.impact_stat2_label, icon: settings.impact_stat2_icon },
        { number: settings.impact_stat3_number, label: settings.impact_stat3_label, icon: settings.impact_stat3_icon },
        { number: settings.impact_stat4_number, label: settings.impact_stat4_label, icon: settings.impact_stat4_icon },
    ];
    
    const stats = statsConfig.filter((s) => s.number && s.label);

    if (!stats.length) return null;

    return (
        <section className="py-24 bg-[#fffdfa] relative overflow-hidden border-y border-amber-500/10">
            {/* Subtle paper noise */}
            <div 
                className="absolute inset-0 opacity-[0.2] pointer-events-none mix-blend-multiply"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
            />
            {/* Subtle watercolor blob */}
            <div className="absolute top-[20%] right-[30%] w-125 h-125 bg-amber-50/50 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {stats.map((stat, idx) => (
                        <StatCard key={idx} number={stat.number || ""} label={stat.label || ""} icon={stat.icon || "Heart"} />
                    ))}
                </div>
            </div>
        </section>
    );
}
