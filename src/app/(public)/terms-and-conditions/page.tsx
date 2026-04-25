import type { Metadata } from "next";
import { PolicyPageShell } from "@/components/public/PolicyPageShell";
import { getAllSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
    title: "Terms and Conditions",
    description: "Review the terms that govern use of this website and its services.",
};

export const dynamic = "force-dynamic";

export default async function TermsAndConditionsPage() {
    const settings = await getAllSiteSettings();

    return (
        <PolicyPageShell
            eyebrow="Legal"
            title="Terms and Conditions"
            subtitle="By using the donation facility on this website, you agree to these terms governing donations, compliance, and policy updates."
            lastUpdated="25 April 2026"
            rightPanelTitle="Scope"
            rightPanelBody="These terms apply to all users who access or contribute through the Nirashray Foundation donation platform."
            contactEmail={settings.contact_email}
            accent="blue"
            sections={[
                {
                    title: "General",
                    body: "By accessing and using the donation facility available on our website, you agree to comply with and be bound by these Terms and Conditions.",
                    points: [
                        "These terms are applicable to all donation-related interactions on the platform.",
                        "Use of the website indicates acceptance of current policy terms.",
                    ],
                },
                {
                    title: "Use of Donations",
                    body: "All contributions received by Nirashray Foundation are used strictly for charitable activities and mission-aligned community impact programs.",
                    points: [
                        "Funds support community welfare, education, healthcare, and cow protection initiatives.",
                        "Utilization of funds is subject to annual audits.",
                        "All financial usage follows applicable Indian legal and statutory requirements.",
                    ],
                },
                {
                    title: "Tax Benefits",
                    body: "Eligible donations may qualify for tax deductions under Section 80G of the Income Tax Act, subject to prevailing legal provisions.",
                    points: [
                        "Donors receive donation receipts for their contributions.",
                        "Relevant tax certificates are issued where applicable.",
                    ],
                },
                {
                    title: "No Commercial Benefit",
                    body: "Donations are voluntary charitable contributions and do not create entitlement to goods, services, investment returns, or commercial benefit.",
                    points: [
                        "Contributions are treated as philanthropic support only.",
                        "No transactional or profit-based benefit is attached to donations.",
                    ],
                },
                {
                    title: "Limitation of Liability",
                    body: "While we take reasonable care in donation processing, Nirashray Foundation is not liable for loss or damage arising from external technical factors.",
                    points: [
                        "This includes temporary technical interruptions on digital systems.",
                        "This includes bank-side issues and third-party payment gateway failures.",
                    ],
                },
                {
                    title: "Amendments",
                    body: "Nirashray Foundation reserves the right to revise, modify, or update these Terms and Conditions at any time without prior notice.",
                    points: [
                        "Latest terms published on this page will be considered effective.",
                        "Continued use of the donation facility indicates acceptance of revised terms.",
                    ],
                },
            ]}
            
        />
    );
}
