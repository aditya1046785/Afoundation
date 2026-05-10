"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ElementType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, HeartPulse, IndianRupee, Sparkles, Users } from "lucide-react";
import { formatCurrency, formatRelativeTime, truncate } from "@/lib/utils";

interface HeroProps {
    settings: Record<string, string>;
    liveImpact?: {
        livesChanged: number;
        donationsRaised: number;
        activeSupporters: number;
    };
    recentDonations?: Array<LiveDonation>;
}

type LiveDonation = {
    id: string;
    donorName: string;
    amount: number;
    message?: string | null;
    purpose?: string | null;
    paidAt?: string | null;
};

// No hardcoded donor names — HeroPanel will use live data from the API.
const fallbackDonations: LiveDonation[] = [];

function parseLooseNumber(value?: string) {
    const numeric = Number((value || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
}

function formatCompactCount(value: number) {
    if (value >= 10000000) return `${(value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
    return `${Math.round(value)}`;
}

function formatCompactCurrency(value: number) {
    const amount = Math.max(0, Math.round(value));
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    return formatCurrency(amount);
}

function getFirstName(fullName: string) {
    return fullName.trim().split(/\s+/)[0] || "Friend";
}

function getImpactMessage(donation: { amount: number; message?: string | null; purpose?: string | null }) {
    if (donation.message) return truncate(donation.message.replace(/\s+/g, " ").trim(), 72);
    if (donation.purpose) return `Supporting ${donation.purpose.toLowerCase()} with care and consistency.`;
    if (donation.amount >= 5000) return "Helping a family receive steady support.";
    if (donation.amount >= 2000) return "Fueling a meaningful step forward today.";
    return "Adding warmth to ongoing community work.";
}

function AnimatedCount({ value, formatter }: { value: number; formatter: (current: number) => string }) {
    const reduceMotion = useReducedMotion();
    const [displayValue, setDisplayValue] = useState(reduceMotion ? value : 0);

    useEffect(() => {
        if (reduceMotion) {
            setDisplayValue(value);
            return;
        }

        let frame = 0;
        const duration = 1400;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(value * eased));

            if (progress < 1) {
                frame = window.requestAnimationFrame(tick);
            }
        };

        frame = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(frame);
    }, [value, reduceMotion]);

    return <span>{formatter(displayValue)}</span>;
}

function LiveMetricCard({
    label,
    value,
    formatter,
    icon: Icon,
    accent = false,
}: {
    label: string;
    value: number;
    formatter: (current: number) => string;
    icon: ElementType;
    accent?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-white/55 bg-white/65 px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</span>
                <div className={"w-10 h-10 rounded-full flex items-center justify-center border " + (accent ? "border-amber-200 bg-amber-50 text-amber-600" : "border-slate-200 bg-[#fbfaf4] text-slate-700")}>
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
            </div>
            <p className="font-serif text-3xl lg:text-[2rem] font-bold tracking-tight text-slate-900 leading-none">
                <AnimatedCount value={value} formatter={formatter} />
            </p>
        </div>
    );
}

export function HeroSection({ settings, liveImpact, recentDonations }: HeroProps) {
    const badgeText = settings.hero_badge_text || "The Art of Giving";
    const heading = settings.hero_heading || "Nirashray Foundation";
    const subheading = settings.hero_subheading || "Empowering Lives, Building Hope";
    const descriptionSuffix = settings.hero_description_suffix || "Every life we touch adds a new, beautiful color to the canvas of humanity.";
    const cta1Text = settings.hero_cta1_text || "Donate Now";
    const cta1Link = settings.hero_cta1_link || "/donate";
    const cta2Text = settings.hero_cta2_text || "Join Us";
    const cta2Link = settings.hero_cta2_link || "/register";
    const siteName = settings.site_name || "Nirashray Foundation";
    const reduceMotion = useReducedMotion();

    const fallbackLivesChanged = parseLooseNumber(settings.impact_stat1_number);
    const fallbackDonationsRaised = parseLooseNumber(settings.impact_stat2_number);
    const fallbackSupporters = parseLooseNumber(settings.impact_stat3_number);

    const stats = useMemo(() => ({
        livesChanged: liveImpact?.livesChanged || fallbackLivesChanged || 1240,
        donationsRaised: liveImpact?.donationsRaised || fallbackDonationsRaised || 980000,
        activeSupporters: liveImpact?.activeSupporters || fallbackSupporters || 318,
    }), [fallbackLivesChanged, fallbackDonationsRaised, fallbackSupporters, liveImpact?.activeSupporters, liveImpact?.donationsRaised, liveImpact?.livesChanged]);

    // donorFeed is driven by client polling; initialize from server-provided prop if present
    const initialFeed = useMemo(() => {
        const source: LiveDonation[] = recentDonations?.length ? recentDonations : fallbackDonations;
        return source.slice(0, 8).map((d) => ({
            ...d,
            firstName: getFirstName(d.donorName),
            impactMessage: getImpactMessage(d),
            relativeTime: d.paidAt ? formatRelativeTime(d.paidAt) : 'Just now',
        }));
    }, [recentDonations]);

    const [donorFeed, setDonorFeed] = useState(() => [...initialFeed, ...initialFeed]);
    const [liveStats, setLiveStats] = useState(() => ({
        donationsRaised: stats.donationsRaised,
        activeSupporters: stats.activeSupporters,
    }));

    useEffect(() => {
        let mounted = true;
        // Poll every 9 seconds for live updates
        const fetchUpdates = async () => {
            try {
                const res = await fetch('/api/public/recent-donations');
                if (!res.ok) return;
                const json = await res.json();
                if (!mounted) return;
                if (json.success) {
                    const items: LiveDonation[] = (json.recentDonations || []).slice(0, 8).map((d: any) => ({
                        id: d.id,
                        donorName: d.donorName || 'Friend',
                        amount: d.amount || 0,
                        message: d.message || null,
                        purpose: d.purpose || null,
                        paidAt: d.paidAt || null,
                    }));

                    const processed = items.map((d) => ({
                        ...d,
                        firstName: getFirstName(d.donorName),
                        impactMessage: getImpactMessage(d),
                        relativeTime: d.paidAt ? formatRelativeTime(d.paidAt) : 'Just now',
                    }));

                    setDonorFeed((prev) => {
                        const merged = [...processed, ...prev];
                        // keep list length reasonable
                        return merged.slice(0, 16);
                    });

                    setLiveStats({
                        donationsRaised: json.totalRaised ?? stats.donationsRaised,
                        // Use total approved members as Active Supporters (real membership count)
                        activeSupporters: json.approvedMembers ?? stats.activeSupporters,
                    });
                }
            } catch (e) {
                // silent fail for progressive enhancement
            }
        };

        fetchUpdates();
        const id = setInterval(fetchUpdates, 9000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [stats.donationsRaised, stats.activeSupporters]);

    const floatingParticles = [
        { className: "left-[10%] top-[14%] h-3 w-3", delay: 0 },
        { className: "right-[14%] top-[24%] h-2.5 w-2.5", delay: 0.6 },
        { className: "left-[22%] bottom-[18%] h-2 w-2", delay: 1.1 },
        { className: "right-[24%] bottom-[14%] h-3 w-3", delay: 1.7 },
    ];

    return (
        <section className="relative overflow-hidden bg-[#f8f4ec] py-20 md:py-24 lg:py-28">
            <div
                className="absolute inset-0 opacity-[0.34] pointer-events-none mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="absolute -top-20 -left-24 h-80 w-80 rounded-full bg-amber-100/45 blur-[120px] pointer-events-none" />
            <div className="absolute top-16 -right-28 h-96 w-96 rounded-full bg-[#e7dcc6]/55 blur-[140px] pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                {floatingParticles.map((particle, index) => (
                    <motion.span
                        key={index}
                        className={`absolute rounded-full bg-amber-200/40 shadow-[0_0_30px_rgba(212,163,62,0.18)] ${particle.className}`}
                        animate={reduceMotion ? undefined : { y: [0, -14, 0], opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }}
                        transition={reduceMotion ? undefined : { duration: 6 + index, repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
                    />
                ))}
            </div>

            <div className="relative z-10 container mx-auto max-w-7xl px-6">
                <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] xl:gap-20">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-2xl"
                    >
                      

                        <p className="mt-10 font-serif italic text-lg md:text-2xl tracking-wide text-amber-700/90">
                            {badgeText}
                        </p>

                        <h1 className="mt-4 max-w-3xl font-serif text-5xl font-bold tracking-tight text-slate-900 leading-[0.98] md:text-7xl lg:text-[5.4rem]">
                            {heading.split(" ").map((word, i, arr) => (
                                <span key={i} className="relative inline-block">
                                    {word}
                                    {i !== arr.length - 1 && <span>&nbsp;</span>}
                                    {i === 0 && (
                                        <svg className="absolute -bottom-3 left-0 h-3 w-full text-amber-400 stroke-current" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                                            <path d="M0,5 Q50,-4 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                                        </svg>
                                    )}
                                </span>
                            ))}
                        </h1>

                        <p className="mt-8 max-w-xl text-lg md:text-xl font-light leading-relaxed text-slate-600">
                            {subheading} {descriptionSuffix}
                        </p>

                        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-5">
                            <Link href={cta1Link}>
                                <Button className="group h-14 rounded-full bg-slate-900 px-8 text-base font-medium tracking-wide text-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.8)] transition-all duration-300 hover:bg-slate-800 hover:-translate-y-px">
                                    {cta1Text}
                                    <Heart className="ml-3 h-4 w-4 fill-amber-400 text-amber-400 transition-transform group-hover:scale-110" />
                                </Button>
                            </Link>

                            <Link href={cta2Link}>
                                <Button variant="ghost" className="group h-14 rounded-full border border-slate-200/80 bg-white/55 px-8 text-base font-medium tracking-wide text-slate-700 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-md transition-all duration-300 hover:border-slate-300 hover:bg-white">
                                    {cta2Text}
                                    <ArrowRight className="ml-2 h-4 w-4 text-amber-600 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                        className="relative"
                    >
                        <div className="absolute -inset-6 rounded-[2.5rem] bg-amber-100/20 blur-2xl" aria-hidden="true" />

                        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 p-4 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.75)] backdrop-blur-2xl sm:p-6">
                            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                                <div className="absolute left-8 top-10 h-40 w-40 rounded-full bg-amber-100/40 blur-3xl" />
                                <div className="absolute right-6 top-20 h-36 w-36 rounded-full bg-[#efe4cf]/60 blur-3xl" />
                                <div className="absolute bottom-0 left-1/2 h-24 w-[85%] -translate-x-1/2 rounded-full bg-[#f9f4ea] blur-2xl" />
                            </div>

                            <div className="relative space-y-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-700">
                                            <Sparkles className="h-4 w-4" />
                                            Live Impact
                                        </p>
                                        <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-slate-900">
                                            The work is moving in real time.
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-white/75 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_0_6px_rgba(212,163,62,0.15)]" />
                                        Updated moments ago
                                    </div>
                                </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <LiveMetricCard
                                        label="Donations Raised"
                                        value={liveStats.donationsRaised}
                                        formatter={formatCompactCurrency}
                                        icon={IndianRupee}
                                    />
                                    <LiveMetricCard
                                        label="Active Supporters"
                                        value={liveStats.activeSupporters}
                                        formatter={formatCompactCount}
                                        icon={Users}
                                    />
                                </div>

                                <div className="rounded-2xl border border-white/70 bg-[#fcfaf5]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Heartbeat</p>
                                            <p className="mt-1 text-sm text-slate-600">A gentle pulse that mirrors every contribution.</p>
                                        </div>
                                        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700">Alive</span>
                                    </div>

                                    <svg viewBox="0 0 600 64" className="mt-3 h-16 w-full overflow-visible" role="img" aria-label="Animated pulse line">
                                        <defs>
                                            <linearGradient id="pulse-line-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                                                <stop offset="0%" stopColor="#d4a33e" stopOpacity="0.15" />
                                                <stop offset="45%" stopColor="#d4a33e" stopOpacity="1" />
                                                <stop offset="100%" stopColor="#d4a33e" stopOpacity="0.2" />
                                            </linearGradient>
                                        </defs>
                                        <motion.path
                                            d="M0 32 H110 L132 18 L150 48 L168 28 H270 L292 24 L312 42 L332 30 H430 L452 22 L472 38 L492 30 H600"
                                            fill="none"
                                            stroke="url(#pulse-line-gradient)"
                                            strokeWidth="2.75"
                                            strokeLinecap="round"
                                            initial={reduceMotion ? false : { pathLength: 0.65, opacity: 0.7 }}
                                            animate={reduceMotion ? undefined : { pathLength: [0.65, 0.82, 0.65], opacity: [0.65, 1, 0.65] }}
                                            transition={reduceMotion ? undefined : { duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        <motion.circle
                                            cx="0"
                                            cy="32"
                                            r="4"
                                            fill="#d4a33e"
                                            animate={reduceMotion ? undefined : { x: [0, 600], opacity: [0, 1, 0] }}
                                            transition={reduceMotion ? undefined : { duration: 4.4, repeat: Infinity, ease: "linear" }}
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Recent donor feed</p>
                                            <p className="mt-1 text-sm text-slate-600">Fresh acts of generosity flowing upward.</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                            Auto-scrolling
                                        </div>
                                    </div>

                                    <div className="relative mt-4 h-72 overflow-hidden rounded-3xl border border-white/60 bg-white/55">
                                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-linear-to-b from-[#fcfaf5] to-transparent" aria-hidden="true" />
                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-linear-to-t from-[#fcfaf5] to-transparent" aria-hidden="true" />

                                        <motion.div
                                            className="space-y-3 p-3 will-change-transform"
                                            animate={reduceMotion ? undefined : { y: ["0%", "-50%"] }}
                                            transition={reduceMotion ? undefined : { duration: 22, ease: "linear", repeat: Infinity }}
                                        >
                                            {donorFeed.map((donation, index) => (
                                                <article
                                                    key={`${donation.id}-${index}`}
                                                    className="flex items-start gap-3 rounded-4xl border border-slate-100/80 bg-[#fffdf8]/95 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.35)]"
                                                >
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm">
                                                        {donation.firstName[0]?.toUpperCase() || "F"}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{donation.firstName}</p>
                                                                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{donation.relativeTime}</p>
                                                            </div>
                                                            <p className="shrink-0 text-sm font-semibold text-amber-700">{formatCurrency(donation.amount)}</p>
                                                        </div>
                                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{donation.impactMessage}</p>
                                                    </div>
                                                </article>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
