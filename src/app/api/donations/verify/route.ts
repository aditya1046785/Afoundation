import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendDonationReceiptEmail } from "@/lib/email";
import {
    PAYMENT_STATUS_TRANSITIONS,
    getAllowedFromStates,
} from "@/lib/state-transitions";

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

        // 4: Payment already COMPLETED hai to dubara process mat karo, existing success response return karo (idempotent)
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

        const allowedFromStates = getAllowedFromStates(PAYMENT_STATUS_TRANSITIONS, "COMPLETED");
        const crowdfundingMeta = parseCrowdfundingMeta(donationRecord.notes);
        const now = new Date();
        const campaignPurpose = crowdfundingMeta
            ? `Crowdfunding - ${crowdfundingMeta.crowdfundingCampaignTitle || "Campaign"}`
            : null;

        let shouldSendEmail = false;

        const updatedDonation = await prisma.$transaction(async (tx) => {
            // Guarded status transition using updateMany
            const updateResult = await tx.donation.updateMany({
                where: {
                    id: donationRecord.id,
                    status: { in: allowedFromStates },
                },
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

            // 5: Koi bhi side-effect sirf tab chalao jab updateMany ne count ≥ 1 diya
            if (updateResult.count >= 1) {
                shouldSendEmail = true;

                if (crowdfundingMeta?.crowdfundingCampaignId) {
                    await tx.crowdfundingCampaign.update({
                        where: { id: crowdfundingMeta.crowdfundingCampaignId },
                        data: {
                            raised: { increment: donationRecord.amount },
                        },
                    });
                }
            }

            return tx.donation.findUnique({
                where: { id: donationRecord.id },
            });
        });

        if (!updatedDonation) {
            return NextResponse.json({ success: false, error: "Donation not found" }, { status: 404 });
        }

        // If count was 0, it was already transitioned or in an invalid state; return idempotent success
        if (!shouldSendEmail) {
            console.log(`[Donation Verify] Payment already transitioned or state guard prevented update for ${donationRecord.id}`);
            return NextResponse.json({
                success: true,
                message: "Payment already verified",
                data: {
                    receiptNumber: updatedDonation.receiptNumber,
                    donationId: updatedDonation.id,
                    paymentId: razorpay_payment_id,
                },
                emailSent: false,
            });
        }

        // Send receipt email ONLY if updateMany returned count >= 1
        const emailSent = await sendDonationReceiptEmail(updatedDonation.donorEmail, {
            donorName: updatedDonation.donorName,
            amount: updatedDonation.amount,
            receiptNumber: updatedDonation.receiptNumber,
            date: (updatedDonation.paidAt || now).toISOString(),
            purpose: updatedDonation.purpose || "General Donation",
            transactionId: razorpay_payment_id,
        });

        return NextResponse.json({
            success: true,
            message: emailSent ? "Payment verified successfully" : "Payment verified successfully, but receipt email could not be sent",
            data: {
                receiptNumber: updatedDonation.receiptNumber,
                donationId: updatedDonation.id,
                paymentId: razorpay_payment_id,
            },
            emailSent,
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
    }
}
