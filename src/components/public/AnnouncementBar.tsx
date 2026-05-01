"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

interface Announcement {
    id: string;
    message: string;
    linkText?: string | null;
    linkUrl?: string | null;
    type: string;
}

const typeColors: Record<string, string> = {
    INFO: "bg-blue-600",
    URGENT: "bg-red-600",
    SUCCESS: "bg-emerald-600",
    WARNING: "bg-amber-500",
};

export function AnnouncementBar() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const barRef = useRef<HTMLDivElement | null>(null);

    const setAnnouncementHeight = (height: number) => {
        document.documentElement.style.setProperty("--announcement-height", `${height}px`);
    };

    useEffect(() => {
        fetch("/api/announcements")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.data.length > 0) {
                    setAnnouncements(data.data);
                }
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!announcements.length || dismissed) {
            setAnnouncementHeight(0);
            return;
        }

        const updateHeight = () => {
            setAnnouncementHeight(barRef.current?.offsetHeight ?? 0);
        };

        updateHeight();

        const resizeObserver = new ResizeObserver(updateHeight);
        if (barRef.current) resizeObserver.observe(barRef.current);
        window.addEventListener("resize", updateHeight);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateHeight);
        };
    }, [announcements.length, dismissed, currentIndex]);

    useEffect(() => {
        return () => {
            setAnnouncementHeight(0);
        };
    }, []);

    // Rotate announcements every 5 seconds if multiple
    useEffect(() => {
        if (announcements.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((i) => (i + 1) % announcements.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [announcements.length]);

    if (!announcements.length || dismissed) return null;

    const current = announcements[currentIndex];
    const colorClass = typeColors[current.type] || "bg-blue-600";

    return (
        <AnimatePresence>
            <motion.div
                ref={barRef}
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                className={`relative ${colorClass} text-white text-sm py-2 px-4`}
            >
                <div className="container mx-auto flex items-center justify-center gap-3 text-center max-w-5xl">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={current.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="font-medium flex items-center gap-2 flex-wrap justify-center"
                        >
                            {current.message}
                            {current.linkText && current.linkUrl && (
                                <Link
                                    href={current.linkUrl}
                                    className="underline font-bold inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                                    target={current.linkUrl.startsWith("http") ? "_blank" : undefined}
                                >
                                    {current.linkText}
                                    {current.linkUrl.startsWith("http") && <ExternalLink className="w-3 h-3" />}
                                </Link>
                            )}
                        </motion.p>
                    </AnimatePresence>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                    aria-label="Dismiss announcement"
                >
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
