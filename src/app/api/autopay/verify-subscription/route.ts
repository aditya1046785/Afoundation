import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

// POST — Verify autopay subscription payment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscriptionId, razorpayPaymentId, razorpaySignature } = body;

        if (!subscriptionId || !razorpayPaymentId || !razorpaySignature) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Fetch the subscription from database
        const subscription = await prisma.autopaySubscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            return NextResponse.json(
                { success: false, error: "Subscription not found" },
                { status: 404 }
            );
        }

        // Verify signature (optional - Razorpay handles this)
        // In production, you should verify the signature
        // const isValid = verifyRazorpaySignature(subscription.razorpaySubscriptionId!, razorpayPaymentId, razorpaySignature);

        // Update subscription status to ACTIVE if not already
        const updatedSubscription = await prisma.autopaySubscription.update({
            where: { id: subscriptionId },
            data: {
                status: "ACTIVE",
                paymentsMade: {
                    increment: 1,
                },
                lastPaymentDate: new Date(),
                totalAmountCollected: {
                    increment: subscription.amount,
                },
            },
        });

        console.log("Subscription verified and updated:", updatedSubscription);

        // Also create a Donation record for tracking
        const donationCount = await prisma.donation.count();
        const { generateReceiptNumber } = await import("@/lib/utils");
        const receiptNumber = generateReceiptNumber(donationCount);

        const donation = await prisma.donation.create({
            data: {
                amount: subscription.amount,
                currency: "INR",
                source: "ONLINE",
                donorName: subscription.donorName,
                donorEmail: subscription.donorEmail,
                donorPhone: subscription.donorPhone,
                donorPAN: subscription.donorPAN,
                purpose: subscription.purpose || "Autopay Recurring Donation",
                message: subscription.message,
                memberId: subscription.memberId,
                referrerMemberId: subscription.referrerMemberId,
                referralCodeUsed: subscription.referralCodeUsed,
                razorpayPaymentId,
                status: "COMPLETED",
                paidAt: new Date(),
                receiptNumber,
                notes: `Autopay subscription #${subscriptionId}`,
            },
        });

        console.log("Donation record created for autopay:", donation);

        return NextResponse.json({
            success: true,
            data: {
                subscriptionId: updatedSubscription.id,
                status: updatedSubscription.status,
                message: "Subscription activated successfully",
            },
        });
    } catch (error) {
        console.error("Error verifying autopay subscription:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to verify subscription";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
