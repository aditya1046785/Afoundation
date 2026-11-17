"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ExternalLink, Megaphone, Pause, Play, X } from "lucide-react";
import styles from "./AnnouncementBar.module.css";

interface Announcement {
    id: string;
    message: string;
    linkText?: string | null;
    linkUrl?: string | null;
    type: string;
}

const typeColors: Record<string, string> = {
    INFO: "bg-sky-300",
    URGENT: "bg-rose-400",
    SUCCESS: "bg-emerald-300",
    WARNING: "bg-amber-300",
};

export function AnnouncementBar() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [paused, setPaused] = useState(false);
    const [duration, setDuration] = useState(30);
    const groupRef = useRef<HTMLDivElement>(null);
    const visible = announcements.length > 0 && !dismissed;

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/announcements", { signal: controller.signal })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data?.success && Array.isArray(data.data)) setAnnouncements(data.data);
            })
            .catch(() => { /* Keep the reserved strip when updates are unavailable. */ })
            .finally(() => {
                if (!controller.signal.aborted) setLoaded(true);
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;
        // A constant pixel speed keeps long messages as readable as short ones.
        const observer = new ResizeObserver(() => setDuration(Math.max(20, group.offsetWidth / 45)));
        observer.observe(group);
        return () => observer.disconnect();
    }, [visible, announcements]);

    const renderMessages = (duplicate: boolean) => announcements.map((announcement) => (
        <span key={announcement.id} className={styles.message}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${typeColors[announcement.type] || typeColors.INFO}`} aria-hidden="true" />
            <span className="sr-only">{announcement.type}: </span>
            <span>{announcement.message}</span>
            {announcement.linkText && announcement.linkUrl && (
                <Link
                    href={announcement.linkUrl}
                    tabIndex={duplicate ? -1 : undefined}
                    className="inline-flex items-center gap-1 font-semibold text-amber-200 underline underline-offset-4 hover:text-white"
                    target={announcement.linkUrl.startsWith("http") ? "_blank" : undefined}
                    rel={announcement.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                    {announcement.linkText}
                    {announcement.linkUrl.startsWith("http") && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
                </Link>
            )}
        </span>
    ));

    return (
        <aside className={styles.bar} aria-label="Latest announcements">
            <div className={styles.label}>
                <Megaphone className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Updates</span>
            </div>
            {visible ? (
                <>
                    <div className={styles.viewport} tabIndex={0} aria-label="Announcements. Focus to pause; scroll horizontally to read.">
                        <div
                            className={styles.track}
                            data-paused={paused}
                            style={{ "--ticker-duration": `${duration}s` } as CSSProperties}
                        >
                            <div ref={groupRef} className={styles.group}>{renderMessages(false)}</div>
                            <div className={`${styles.group} ${styles.duplicate}`} aria-hidden="true">{renderMessages(true)}</div>
                        </div>
                    </div>
                    <div className={styles.controls}>
                        <button className={styles.button} onClick={() => setPaused(!paused)} aria-label={paused ? "Resume announcements" : "Pause announcements"} aria-pressed={paused}>
                            {paused ? <Play size={14} /> : <Pause size={14} />}
                        </button>
                        <button className={styles.button} onClick={() => setDismissed(true)} aria-label="Hide announcements">
                            <X size={16} />
                        </button>
                    </div>
                </>
            ) : (
                <div className={styles.empty}>
                    <span>{dismissed ? "Updates hidden" : loaded ? "No updates right now" : "Loading updates…"}</span>
                    {dismissed && <button className="shrink-0 text-amber-200 underline underline-offset-4" onClick={() => setDismissed(false)}>Show updates</button>}
                </div>
            )}
        </aside>
    );
}
