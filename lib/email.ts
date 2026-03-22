import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { DonationReceiptEmail } from "@/emails/DonationReceipt";
import { MemberApprovalEmail } from "@/emails/MemberApproval";
import { CertificateIssuedEmail } from "@/emails/CertificateIssued";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_fallback_key');
const FROM = process.env.EMAIL_FROM || "Nirashray Foundation <onboarding@resend.dev>";

/**
 * Send welcome email to newly registered member
 */
export async function sendWelcomeEmail(to: string, name: string, memberId: string, membershipType = "General") {
    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: "Welcome to Nirashray Foundation!",
            react: WelcomeEmail({ name, memberId, membershipType }),
        });
    } catch (error) {
        console.error("Failed to send welcome email:", error);
    }
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
    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: `Donation Receipt - ${data.receiptNumber}`,
            react: DonationReceiptEmail(data),
        });
    } catch (error) {
        console.error("Failed to send donation receipt email:", error);
    }
}

/**
 * Send membership approved email
 */
export async function sendMemberApprovedEmail(to: string, name: string, memberId: string) {
    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: "Your Membership has been Approved!",
            react: MemberApprovalEmail({ name, memberId, approved: true }),
        });
    } catch (error) {
        console.error("Failed to send approval email:", error);
    }
}

/**
 * Send membership rejected email
 */
export async function sendMemberRejectedEmail(to: string, name: string, reason: string) {
    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: "Update on Your Membership Application",
            react: MemberApprovalEmail({ name, memberId: "", approved: false, reason }),
        });
    } catch (error) {
        console.error("Failed to send rejection email:", error);
    }
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
    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject: `Your ${certificateType} Certificate is Ready!`,
            react: CertificateIssuedEmail({ name, certificateType, certificateNo }),
        });
    } catch (error) {
        console.error("Failed to send certificate email:", error);
    }
}
