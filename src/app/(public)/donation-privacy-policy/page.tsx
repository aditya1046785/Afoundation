import type { Metadata } from "next";
import { PolicyPageShell } from "@/components/public/PolicyPageShell";
import { getAllSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
    title: "Donation Privacy Policy",
    description: "Understand how donation-related information is collected, used, and protected.",
};

export const dynamic = "force-dynamic";

export default async function DonationPrivacyPolicyPage() {
    const settings = await getAllSiteSettings();

    return (
        <PolicyPageShell
            eyebrow="Trust"
            title="Donation Privacy Policy"
            subtitle="At Nirashray Foundation, we treat donor and visitor information with care, transparency, and strict confidentiality."
            lastUpdated="25 April 2026"
            rightPanelTitle="Why this matters"
            rightPanelBody="Clear privacy commitments build trust and ensure every contribution is handled responsibly from payment to reporting."
            contactEmail={settings.contact_email}
            accent="amber"
            sections={[
                {
                    title: "Information We Collect",
                    body: "To process donations and provide lawful documentation, we collect essential donor details during contribution and receipt generation.",
                    points: [
                        "Name, email address, phone number, and postal address.",
                        "PAN details where required for 80G receipt issuance.",
                        "Donation amount, payment reference, and transaction confirmation details.",
                    ],
                },
                {
                    title: "How We Use Your Information",
                    body: "Your information is used only for legitimate operational, financial, and compliance purposes connected to your donation.",
                    points: [
                        "To issue donation receipts and 80G certificates.",
                        "To share updates about our programs and activities.",
                        "For accounting, audits, statutory reporting, and secure online transaction processing.",
                    ],
                },
                {
                    title: "Sharing of Information",
                    body: "We do not commercialize donor data. Information is shared only when necessary for donation processing or legal compliance.",
                    points: [
                        "Shared with authorized payment gateways or banks for transaction completion.",
                        "Disclosed to government authorities only when legally required.",
                        "Never sold, rented, or misused for unrelated marketing purposes.",
                    ],
                },
                {
                    title: "Data Security",
                    body: "We follow practical technical and administrative safeguards to protect personal and financial records from unauthorized access.",
                    points: [
                        "SSL encryption (https://) is used for secure online transactions.",
                        "Access to donor records is restricted to authorized personnel only.",
                        "Regular review, audit, and compliance checks are carried out.",
                    ],
                },
                {
                    title: "Your Consent",
                    body: "By making a donation through our platform, you acknowledge and consent to the collection and use of your information as described in this policy.",
                    points: [
                        "Consent applies to receipt generation and required statutory documentation.",
                        "You may contact us anytime for clarification on privacy practices.",
                    ],
                },
            ]}
            footerNote={
                <div className="space-y-2">
                    <p className="font-serif text-slate-800 text-lg">Contact for Privacy Queries</p>
                    <p>Nirashray Foundation, pratapgharj, Uttar Pradesh</p>
                    <p>
                        Email: <a className="text-amber-700 hover:text-amber-600 transition-colors" href="mailto:nirashrayfoundation@gmail.com">nirashrayfoundation@gmail.com</a>
                    </p>
                    <p>
                        Phone: <a className="text-amber-700 hover:text-amber-600 transition-colors" href="tel:+919152529033">+91-9152529033</a>
                    </p>
                </div>
            }
        />
    );
}
