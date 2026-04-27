import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendDonationReceiptEmail } from "@/lib/email";

type CrowdfundingMeta = {
    donationType?: "crowdfunding" | "general";
    crowdfundingCampaignId?: string;
    crowdfundingCampaignTitle?: string;
};

function parseCrowdfundingMeta(rawNotes: string | null): CrowdfundingMeta | null {
    if (!rawNotes) return null;

    try {
        const parsed = JSON.parse(rawNotes) as CrowdfundingMeta;
        if (parsed?.donationType !== "crowdfunding" || !parsed.crowdfundingCampaignId) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

// POST — Verify Razorpay payment and update donation status
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ success: false, error: "Missing payment details" }, { status: 400 });
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
            return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
        }

        const donationRecord = await prisma.donation.findFirst({
            where: { razorpayOrderId: razorpay_order_id },
            select: {
                id: true,
                amount: true,
                donorEmail: true,
                donorName: true,
                receiptNumber: true,
                purpose: true,
                notes: true,
                status: true,
                paidAt: true,
            },
        });

        if (!donationRecord) {
            return NextResponse.json({ success: false, error: "Donation not found" }, { status: 404 });
        }

        if (donationRecord.status === "COMPLETED") {
            return NextResponse.json({
                success: true,
                message: "Payment already verified",
                data: {
                    receiptNumber: donationRecord.receiptNumber,
                    donationId: donationRecord.id,
                    paymentId: razorpay_payment_id,
                },
                emailSent: false,
            });
        }

        const crowdfundingMeta = parseCrowdfundingMeta(donationRecord.notes);
        const now = new Date();
        const campaignPurpose = crowdfundingMeta
            ? `Crowdfunding - ${crowdfundingMeta.crowdfundingCampaignTitle || "Campaign"}`
            : null;

        const donation = await prisma.$transaction(async (tx) => {
            const updatedDonation = await tx.donation.update({
                where: { id: donationRecord.id },
                data: {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    paymentReference: razorpay_payment_id,
                    status: "COMPLETED",
                    paidAt: now,
                    receiptIssuedAt: now,
                    purpose: campaignPurpose || donationRecord.purpose,
                },
            });

            if (crowdfundingMeta?.crowdfundingCampaignId) {
                await tx.crowdfundingCampaign.update({
                    where: { id: crowdfundingMeta.crowdfundingCampaignId },
                    data: {
                        raised: { increment: updatedDonation.amount },
                    },
                });
            }

            return updatedDonation;
        });

        // Send receipt email
        const emailSent = await sendDonationReceiptEmail(donation.donorEmail, {
            donorName: donation.donorName,
            amount: donation.amount,
            receiptNumber: donation.receiptNumber,
            date: donation.paidAt!.toISOString(),
            purpose: donation.purpose || "General Donation",
            transactionId: razorpay_payment_id,
        });

        return NextResponse.json({
            success: true,
            message: emailSent ? "Payment verified successfully" : "Payment verified successfully, but receipt email could not be sent",
            data: {
                receiptNumber: donation.receiptNumber,
                donationId: donation.id,
                paymentId: razorpay_payment_id,
            },
            emailSent,
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
    }
}
