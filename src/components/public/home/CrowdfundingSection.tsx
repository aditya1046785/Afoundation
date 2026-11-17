"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HandHeart, Heart, LockKeyhole, ShieldCheck, Sparkles, Tag, Users } from "lucide-react";
import styles from "./CrowdfundingSection.module.css";

interface Campaign {
    id: string;
    title: string;
    description: string;
    target: number;
    raised: number;
    image: string;
    category: string;
}

const HAS_80G = false;
const CAUSE_STAT = "100% goes to the cause";
const IMPACT_TEXT = "Every ₹500 can feed 10 children for a day.";
const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(amount);
const validAmount = (amount: number) => Number.isFinite(amount) ? Math.max(0, amount) : 0;
const donateHref = (campaign: Campaign) => ({ pathname: "/donate", query: { campaign: campaign.id, campaignTitle: campaign.title } });

function LiveDot() {
    return <span aria-hidden="true" className={styles.liveDot} />;
}

function StatChip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return <div className={styles.statChip}><span aria-hidden="true" className={styles.statIcon}>{icon}</span><span>{children}</span></div>;
}

function SectionHeader({ campaigns }: { campaigns: Campaign[] }) {
    const total = campaigns.reduce((sum, campaign) => sum + validAmount(campaign.raised), 0);
    return (
        <div className={styles.copy}>
            <h2 id="crowdfunding-heading" className="font-serif">Together, we can<br /><span className={styles.highlight}>fund the change.
                <svg aria-hidden="true" viewBox="0 0 440 20" preserveAspectRatio="none"><path d="M4 12 Q180 1 435 8 M45 18 Q245 9 395 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
            </span></h2>
            <p className={styles.intro}>Help turn care into action. Find a cause close to your heart and support Nirashray&apos;s work with children, families, and communities.</p>
            <div className={styles.stats}>
                <StatChip icon={<HandHeart size={18} />}><strong>{formatCurrency(total)}</strong> raised</StatChip>
                <StatChip icon={<Users size={18} />}><strong>{campaigns.length}</strong> active {campaigns.length === 1 ? "campaign" : "campaigns"}</StatChip>
                <StatChip icon={<Heart size={18} />}>{CAUSE_STAT}</StatChip>
            </div>
            <div className={styles.trustLine}>
                <span><ShieldCheck size={16} aria-hidden="true" />Secure payments</span>
                <span><BadgeCheck size={16} aria-hidden="true" />Transparent updates</span>
                {HAS_80G && <span><BadgeCheck size={16} aria-hidden="true" />Tax benefit (80G)</span>}
            </div>
        </div>
    );
}

function ProgressBar({ raised, target, title }: { raised: number; target: number; title: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const percentage = Math.floor(raised / target * 100);
    const fill = Math.min(100, percentage);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
        }, { threshold: 0.2 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return (
        <div ref={ref} className={styles.progress}>
            <div className={styles.bubblePosition} style={{ left: `clamp(24px, ${fill}%, calc(100% - 24px))` }}><span>{percentage}%</span></div>
            <div role="progressbar" aria-label={`Funding progress for ${title}`} aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${percentage}% funded`} className={styles.track}>
                <div className={styles.fill} style={{ width: `${visible ? fill : 0}%` }} />
            </div>
            <div className={styles.progressLabels}><strong>{percentage}% funded</strong><span>{formatCurrency(Math.max(0, target - raised))} to go</span></div>
        </div>
    );
}

function AmountChips({ amount, onChange }: { amount: number | null; onChange: (amount: number | null) => void }) {
    return (
        <div className={styles.amounts} role="group" aria-label="Choose a suggested donation amount">
            {[100, 500, 1000, 2500, null].map(value => <button key={value ?? "custom"} type="button" aria-pressed={value === amount} onClick={() => onChange(value)}>{value === null ? "Custom" : formatCurrency(value)}</button>)}
        </div>
    );
}

function DonateLink({ campaign, amount }: { campaign: Campaign; amount: number | null }) {
    // The existing form does not consume an amount query parameter. Presets are visual only.
    return <Link href={donateHref(campaign)} className={styles.donate} aria-label={`Support ${campaign.title}${amount ? ` — suggested donation ${formatCurrency(amount)}` : ""}`}>
        <span>{amount ? `Donate ${formatCurrency(amount)} now` : "Support this campaign"}</span><span className={styles.arrow}><ArrowRight size={19} aria-hidden="true" /></span>
    </Link>;
}

function StickyDonateBar({ campaign, amount, visible }: { campaign: Campaign; amount: number | null; visible: boolean }) {
    if (!visible) return null;
    return <div className={styles.sticky} aria-label="Support the featured campaign"><DonateLink campaign={campaign} amount={amount} /></div>;
}

function CampaignCard({ campaign, compact = false }: { campaign: Campaign; compact?: boolean }) {
    const [amount, setAmount] = useState<number | null>(500);
    const [sticky, setSticky] = useState(false);
    const cardRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const raised = validAmount(campaign.raised);
    const target = validAmount(campaign.target);
    useEffect(() => {
        if (compact) return;
        let cardVisible = false;
        let ctaVisible = false;
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.target === cardRef.current) cardVisible = entry.isIntersecting;
                if (entry.target === ctaRef.current) ctaVisible = entry.isIntersecting;
            }
            setSticky(cardVisible && !ctaVisible);
        });
        if (cardRef.current) observer.observe(cardRef.current);
        if (ctaRef.current) observer.observe(ctaRef.current);
        return () => observer.disconnect();
    }, [compact]);
    return (
        <>
            <article ref={cardRef} className={`${styles.card} ${compact ? styles.compact : ""}`}>
                <div className={styles.image}>
                    {/* Replace CMS banners containing baked-in text/buttons with a clean photo. Preserve the supplied image until then. */}
                    {campaign.image ? (
                        // CMS images may use external hosts.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={campaign.image} alt={campaign.title} loading="lazy" decoding="async" />
                    ) : <HandHeart className={styles.placeholder} size={72} aria-hidden="true" />}
                    <div className={styles.imageShade} aria-hidden="true" />
                    <div className={styles.imageChips}><span className={styles.category}><Tag size={14} aria-hidden="true" />{campaign.category.trim() || "Community Support"}</span><span className={styles.status}><LiveDot />Open for support</span></div>
                </div>
                <div className={styles.body}>
                    <h3>{campaign.title.charAt(0).toLocaleUpperCase() + campaign.title.slice(1)}</h3>
                    <p className={`${styles.description} line-clamp-2`}>{campaign.description}</p>
                    <div className={styles.amountBlock}><strong>{formatCurrency(raised)}</strong><span>{target > 0 ? `raised of ${formatCurrency(target)} goal` : "raised · Open goal"}</span></div>
                    {target > 0 && <ProgressBar raised={raised} target={target} title={campaign.title} />}
                    {/* Donor counts and end dates are not supplied by the current campaign model. */}
                    {target > raised && <dl className={styles.miniStats}><div><dt>To reach our goal</dt><dd>{formatCurrency(target - raised)} to go</dd></div></dl>}
                    {!compact && <><p className={styles.impact}><Sparkles size={20} aria-hidden="true" />{IMPACT_TEXT}</p><AmountChips amount={amount} onChange={setAmount} /><p className={styles.amountNote}>Choose your final amount on the donation page.</p></>}
                    <div ref={ctaRef} className={styles.cta}><DonateLink campaign={campaign} amount={compact ? null : amount} /></div>
                    <p className={styles.paymentTrust}><span><LockKeyhole size={13} aria-hidden="true" />100% secure payment</span><span>UPI, Cards &amp; Netbanking</span></p>
                </div>
            </article>
            {!compact && <StickyDonateBar campaign={campaign} amount={amount} visible={sticky} />}
        </>
    );
}

export function CrowdfundingSection({ campaigns }: { campaigns: Campaign[] }) {
    if (!campaigns?.length) return null;
    return (
        <section aria-labelledby="crowdfunding-heading" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.topRow}><p className={styles.badge}><LiveDot />Active Campaigns · Collective Care</p><Link href="/donate" className={styles.ghost}>Make a difference <ArrowRight size={16} aria-hidden="true" /></Link></div>
                <div className={styles.featured}><SectionHeader campaigns={campaigns} /><CampaignCard key={campaigns[0].id} campaign={campaigns[0]} /></div>
                {campaigns.length > 1 && <div className={styles.more}><h3 className="font-serif">More ways to make a difference</h3><div className={styles.grid}>{campaigns.slice(1).map(campaign => <CampaignCard key={campaign.id} campaign={campaign} compact />)}</div></div>}
            </div>
        </section>
    );
}
