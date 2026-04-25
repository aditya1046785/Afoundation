import type { Metadata } from "next";
import { PolicyPageShell } from "@/components/public/PolicyPageShell";
import { getAllSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
    title: "Refund and Cancellation Policy",
    description: "Learn about donation cancellation timelines, eligibility, and refund workflows.",
};

export const dynamic = "force-dynamic";

export default async function RefundAndCancellationPolicyPage() {
    const settings = await getAllSiteSettings();

    return (
        <PolicyPageShell
            eyebrow="Support"
            title="Refund and Cancellation Policy"
            subtitle="All donations are treated as final, with limited refund eligibility available only in specific exceptional cases."
            lastUpdated="25 April 2026"
            rightPanelTitle="Response window"
            rightPanelBody="Refund reviews are limited to verified duplicate transactions or genuine payment errors, subject to the conditions listed below."
            contactEmail={settings.contact_email}
            accent="slate"
            sections={[
                {
                    title: "Finality of Donations",
                    body: "All donations made to Nirashray Foundation are considered final and non-refundable unless they fall under the limited exception described in this policy.",
                    points: [
                        "Donations are made as voluntary charitable contributions.",
                        "General refund requests outside this policy are not accepted.",
                    ],
                },
                {
                    title: "Eligible Refund Requests",
                    body: "If a donor has made an accidental duplicate transaction or a genuine payment error has occurred, a refund request may be submitted within 7 days.",
                    points: [
                        "Email nirashrayfoundation@gmail.com with full payment details.",
                        "Requests must be submitted within 7 days of the transaction.",
                        "Only verified duplicate or error-based payments are eligible for review.",
                    ],
                },
                {
                    title: "Refund Processing",
                    body: "Verified refunds will be returned to the original payment method after successful review and approval by the Foundation.",
                    points: [
                        "Refunds are credited back through the original payment method.",
                        "Processing may take 10 to 15 days after verification.",
                        "Status updates may be communicated through email where required.",
                    ],
                },
                {
                    title: "Foundation Discretion",
                    body: "Nirashray Foundation reserves the right to reject any refund request that does not meet the conditions outlined in this policy.",
                    points: [
                        "Incomplete, late, or unsupported requests may be declined.",
                        "The Foundation’s decision on refund eligibility will be final.",
                    ],
                },
            ]}
            footerNote={
                <p>
                    For any refund-related query, please contact nirashrayfoundation@gmail.com with your transaction information and supporting details.
                </p>
            }
        />
    );
}
