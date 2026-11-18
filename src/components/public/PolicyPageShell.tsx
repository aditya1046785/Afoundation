import { ReactNode } from "react";
import { Clock3, Scale, ShieldCheck, WalletCards } from "lucide-react";

interface PolicySection {
    title: string;
    body: string;
    points?: string[];
}

interface PolicyPageShellProps {
    eyebrow: string;
    title: string;
    subtitle: string;
    lastUpdated: string;
    sections: PolicySection[];
    rightPanelTitle: string;
    rightPanelBody: string;
    contactEmail?: string;
    accent: "amber" | "blue" | "slate";
    footerNote?: ReactNode;
}

function getAccentClasses(accent: PolicyPageShellProps["accent"]) {
    if (accent === "blue") {
        return {
            splash: "bg-brand-neutral-100/40",
            icon: "text-brand-neutral-600",
            iconBg: "bg-brand-neutral-50 border-brand-neutral-100",
            border: "border-brand-neutral-200/40",
            titleLine: "text-brand-neutral-300",
            tag: "text-brand-neutral-700 bg-brand-neutral-50 border-brand-neutral-100",
        };
    }

    if (accent === "slate") {
        return {
            splash: "bg-brand-neutral-200/40",
            icon: "text-brand-neutral-700",
            iconBg: "bg-brand-neutral-100 border-brand-neutral-200",
            border: "border-brand-neutral-200/50",
            titleLine: "text-brand-neutral-300",
            tag: "text-brand-neutral-700 bg-brand-neutral-100 border-brand-neutral-200",
        };
    }

    return {
        splash: "bg-brand-accent-100/40",
        icon: "text-brand-accent-600",
        iconBg: "bg-brand-accent-50 border-brand-accent-100",
        border: "border-brand-accent-200/40",
        titleLine: "text-brand-accent-300",
        tag: "text-brand-accent-700 bg-brand-accent-50 border-brand-accent-100",
    };
}

export function PolicyPageShell({
    eyebrow,
    title,
    subtitle,
    lastUpdated,
    sections,
    rightPanelTitle,
    rightPanelBody,
    contactEmail,
    accent,
    footerNote,
}: PolicyPageShellProps) {
    const accentClasses = getAccentClasses(accent);

    return (
        <div className="min-h-screen bg-[#fcf9f4] relative overflow-hidden font-normal pt-24">
            <div
                className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply fixed"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
            />

            <header className={`relative pt-20 pb-14 text-center border-b ${accentClasses.border}`}>
                <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] rounded-full mix-blend-multiply filter blur-[110px] pointer-events-none ${accentClasses.splash}`}
                />

                <div className="container mx-auto px-6 max-w-4xl relative z-10">
                    <p className="font-serif italic text-xl tracking-wide mb-4 text-brand-neutral-600">{eyebrow}</p>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-brand-neutral-800 tracking-tight relative inline-block leading-[1.1]">
                        {title}
                        <svg
                            className={`absolute -bottom-1 -left-1 w-[110%] h-3 stroke-current opacity-70 ${accentClasses.titleLine}`}
                            viewBox="0 0 100 10"
                            preserveAspectRatio="none"
                        >
                            <path d="M0,5 Q50,-2 100,5" fill="none" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </h1>
                    <p className="text-brand-neutral-500 text-xl font-normal max-w-2xl mx-auto leading-relaxed mt-4">{subtitle}</p>
                </div>
            </header>

            <section className="container mx-auto px-6 max-w-7xl py-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    <article className="lg:col-span-8 space-y-8">
                        {sections.map((section, index) => (
                            <div
                                key={section.title}
                                className="rounded-2xl bg-white/70 backdrop-blur-md border border-white p-7 md:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                            >
                                <div className="flex items-start gap-4 mb-5">
                                    <div
                                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${accentClasses.iconBg}`}
                                    >
                                        <Scale className={`w-5 h-5 ${accentClasses.icon}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-brand-neutral-400 mb-1">Section {index + 1}</p>
                                        <h2 className="font-serif text-3xl font-bold text-brand-neutral-800">{section.title}</h2>
                                    </div>
                                </div>

                                <p className="text-brand-neutral-600 text-lg leading-relaxed">{section.body}</p>

                                {section.points && section.points.length > 0 && (
                                    <ul className="mt-5 space-y-3">
                                        {section.points.map((point) => (
                                            <li key={point} className="flex items-start gap-3 text-brand-neutral-600">
                                                <ShieldCheck className={`w-5 h-5 mt-0.5 shrink-0 ${accentClasses.icon}`} />
                                                <span className="text-base leading-relaxed">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </article>

                    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                        <div className="rounded-2xl p-7 bg-white border border-brand-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                            <div className="flex items-center gap-3 mb-5">
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${accentClasses.iconBg}`}>
                                    <Clock3 className={`w-5 h-5 ${accentClasses.icon}`} />
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-brand-neutral-800">Page Snapshot</h3>
                            </div>
                            <div className="space-y-4 text-brand-neutral-600">
                                <p className="text-sm uppercase tracking-widest text-brand-neutral-400">Last Updated</p>
                                <p className={`inline-flex px-3 py-1.5 rounded-full border text-sm font-medium ${accentClasses.tag}`}>
                                    {lastUpdated}
                                </p>
                                <div className="pt-2 border-t border-brand-neutral-100">
                                    <h4 className="font-serif text-xl text-brand-neutral-800 mb-2">{rightPanelTitle}</h4>
                                    <p className="text-base leading-relaxed">{rightPanelBody}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl p-7 bg-[#023727] border border-brand-neutral-800 text-brand-neutral-300 shadow-[0_8px_30px_rgb(0,0,0,0.15)] relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-[0.3] pointer-events-none mix-blend-overlay"
                                style={{
                                    backgroundImage:
                                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                                }}
                            />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <WalletCards className="w-5 h-5 text-brand-accent-400" />
                                    <h3 className="font-serif text-2xl text-white">Questions?</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-brand-neutral-400">
                                    If you need clarification regarding this policy, our support team will help you with the latest official version.
                                </p>
                                {contactEmail && (
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="inline-block mt-4 text-brand-accent-400 hover:text-brand-accent-300 transition-colors text-sm"
                                    >
                                        {contactEmail}
                                    </a>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {footerNote && (
                <section className="container mx-auto px-6 max-w-4xl pb-20">
                    <div className="rounded-2xl border border-brand-neutral-200/70 bg-white/70 backdrop-blur-md p-7 text-brand-neutral-600 text-base leading-relaxed">
                        {footerNote}
                    </div>
                </section>
            )}
        </div>
    );
}
