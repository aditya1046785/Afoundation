import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { DonationReceiptEmail } from "@/emails/DonationReceipt";
import { MemberApprovalEmail } from "@/emails/MemberApproval";
import { CertificateIssuedEmail } from "@/emails/CertificateIssued";
import { IDCardIssuedEmail } from "@/emails/IDCardIssued";
import type { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const FROM = process.env.EMAIL_FROM || "Nirashray Foundation <onboarding@resend.dev>";

type SendEmailOptions = {
    to: string;
    subject: string;
    react: ReactElement;
    logContext: string;
};

const MAX_EMAIL_RETRIES = 3;

async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendEmail({ to, subject, react, logContext }: SendEmailOptions): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) {
        console.error(`Failed to send ${logContext}: RESEND_API_KEY is not configured.`);
        return false;
    }

    if (!to || !to.trim()) {
        console.error(`Failed to send ${logContext}: recipient email is missing.`);
        return false;
    }

    const html = await render(react);

    for (let attempt = 1; attempt <= MAX_EMAIL_RETRIES; attempt++) {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM,
                to: [to],
                subject,
                html,
            });

            if (!error && data?.id) {
                return true;
            }

            console.error(`Failed to send ${logContext} (attempt ${attempt}/${MAX_EMAIL_RETRIES}):`, error || "Unknown Resend error");
        } catch (error) {
            console.error(`Failed to send ${logContext} (attempt ${attempt}/${MAX_EMAIL_RETRIES}):`, error);
        }

        if (attempt < MAX_EMAIL_RETRIES) {
            await sleep(attempt * 500);
        }
    }

    return false;
}

/**
 * Send welcome email to newly registered member
 */
export async function sendWelcomeEmail(to: string, name: string, memberId: string, membershipType = "General") {
    return sendEmail({
        to,
        subject: "Welcome to Nirashray Foundation!",
        react: WelcomeEmail({ name, memberId, membershipType }),
        logContext: "welcome email",
    });
}

/**
 * Send donation receipt email
 */
export async function sendDonationReceiptEmail(
    to: string,
    data: {
        donorName: string;
        amount: number;
        receiptNumber: string;
        date: string;
        purpose: string;
        transactionId: string;
    }
) {
    return sendEmail({
        to,
        subject: `Donation Receipt - ${data.receiptNumber}`,
        react: DonationReceiptEmail(data),
        logContext: "donation receipt email",
    });
}

/**
 * Send membership approved email
 */
export async function sendMemberApprovedEmail(to: string, name: string, memberId: string) {
    return sendEmail({
        to,
        subject: "Your Membership has been Approved!",
        react: MemberApprovalEmail({ name, memberId, approved: true }),
        logContext: "approval email",
    });
}

/**
 * Send membership rejected email
 */
export async function sendMemberRejectedEmail(to: string, name: string, reason: string) {
    return sendEmail({
        to,
        subject: "Update on Your Membership Application",
        react: MemberApprovalEmail({ name, memberId: "", approved: false, reason }),
        logContext: "rejection email",
    });
}

/**
 * Send certificate issued email
 */
export async function sendCertificateIssuedEmail(
    to: string,
    name: string,
    certificateType: string,
    certificateNo: string
) {
    return sendEmail({
        to,
        subject: `Your ${certificateType} Certificate is Ready!`,
        react: CertificateIssuedEmail({ name, certificateType, certificateNo }),
        logContext: "certificate email",
    });
}

/**
 * Send ID card issued email
 */
export async function sendIDCardIssuedEmail(
    to: string,
    name: string,
    memberId: string,
    cardNumber: string,
    expiryDate: string
) {
    return sendEmail({
        to,
        subject: "Your ID Card is Ready!",
        react: IDCardIssuedEmail({ name, memberId, cardNumber, expiryDate }),
        logContext: "ID card email",
    });
}
