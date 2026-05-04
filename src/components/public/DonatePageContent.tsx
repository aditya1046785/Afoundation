"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DonationToggle } from "./DonationToggle";
import { DonateForm } from "./DonateForm";
import { AutopayForm } from "./AutopayForm";

interface DonatePageContentProps {
    presetAmounts: number[];
    purposes: string[];
}

export function DonatePageContent({ presetAmounts, purposes }: DonatePageContentProps) {
    const [donationType, setDonationType] = useState<"one-time" | "autopay">("one-time");

    return (
        <div>
            {/* Toggle Component */}
            <DonationToggle
                isDonationType={donationType}
                setIsDonationType={setDonationType}
            />

            {/* Forms with animation */}
            <AnimatePresence mode="wait">
                {donationType === "one-time" ? (
                    <DonateForm key="donate-form" presetAmounts={presetAmounts} purposes={purposes} />
                ) : (
                    <AutopayForm key="autopay-form" purposes={purposes} />
                )}
            </AnimatePresence>
        </div>
    );
}
