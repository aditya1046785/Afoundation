import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import crypto from "crypto";

// POST — Handle Razorpay webhooks for autopay subscriptions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const signature = request.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json(
                { success: false, error: "Missing signature" },
                { status: 401 }
            );
        }

        // Verify webhook signature
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!);
        hmac.update(JSON.stringify(body));
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== signature) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 401 }
            );
        }

        const event = body.event;
        const eventData = body.payload;

        console.log(`Processing webhook event: ${event}`, eventData);

        switch (event) {
            case "subscription.charged": {
                // Payment successful for subscription
                const subscriptionId = eventData.subscription?.entity?.id;
                const paymentId = eventData.payment?.entity?.id;

                if (!subscriptionId || !paymentId) {
                    return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
                }

                // Find subscription by razorpay ID
                const subscription = await prisma.autopaySubscription.findFirst({
                    where: { razorpaySubscriptionId: subscriptionId },
                });

                if (!subscription) {
                    console.warn(`Subscription not found for razorpay ID: ${subscriptionId}`);
                    return NextResponse.json({ success: true });
                }

                // Update subscription
                const updatedSubscription = await prisma.autopaySubscription.update({
                    where: { id: subscription.id },
                    data: {
                        paymentsMade: {
                            increment: 1,
                        },
                        totalAmountCollected: {
                            increment: subscription.amount,
                        },
                        lastPaymentDate: new Date(),
                        nextPaymentDate: new Date(Date.now() + (subscription.frequency === "WEEKLY" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
                    },
                });

                // Create Donation record
                const donationCount = await prisma.donation.count();
                const { generateReceiptNumber } = await import("@/lib/utils");
                const receiptNumber = generateReceiptNumber(donationCount);

                await prisma.donation.create({
                    data: {
                        amount: subscription.amount,
                        currency: "INR",
                        source: "ONLINE",
                        donorName: subscription.donorName,
                        donorEmail: subscription.donorEmail,
                        donorPhone: subscription.donorPhone,
                        donorPAN: subscription.donorPAN,
                        purpose: subscription.purpose || `Autopay ${subscription.frequency.toLowerCase()} donation`,
                        message: subscription.message,
                        memberId: subscription.memberId,
                        referrerMemberId: subscription.referrerMemberId,
                        referralCodeUsed: subscription.referralCodeUsed,
                        razorpayPaymentId: paymentId,
                        status: "COMPLETED",
                        paidAt: new Date(),
                        receiptNumber,
                        notes: `Autopay subscription #${subscription.id} - Payment #${updatedSubscription.paymentsMade}`,
                    },
                });

                console.log(`Payment processed for subscription ${subscription.id}`);
                break;
            }

            case "subscription.failed": {
                // Payment failed for subscription
                const subscriptionId = eventData.subscription?.entity?.id;

                if (!subscriptionId) {
                    return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
                }

                const subscription = await prisma.autopaySubscription.findFirst({
                    where: { razorpaySubscriptionId: subscriptionId },
                });

                if (subscription) {
                    // Note: We don't immediately pause/cancel. Razorpay will retry.
                    console.warn(`Payment failed for subscription ${subscription.id}`);
                }
                break;
            }

            case "subscription.paused": {
                // Subscription paused
                const subscriptionId = eventData.subscription?.entity?.id;

                if (!subscriptionId) {
                    return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
                }

                const subscription = await prisma.autopaySubscription.findFirst({
                    where: { razorpaySubscriptionId: subscriptionId },
                });

                if (subscription) {
                    await prisma.autopaySubscription.update({
                        where: { id: subscription.id },
                        data: { status: "PAUSED" },
                    });

                    console.log(`Subscription ${subscription.id} paused`);
                }
                break;
            }

            case "subscription.cancelled": {
                // Subscription cancelled
                const subscriptionId = eventData.subscription?.entity?.id;

                if (!subscriptionId) {
                    return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
                }

                const subscription = await prisma.autopaySubscription.findFirst({
                    where: { razorpaySubscriptionId: subscriptionId },
                });

                if (subscription) {
                    await prisma.autopaySubscription.update({
                        where: { id: subscription.id },
                        data: {
                            status: "CANCELLED",
                            endDate: new Date(),
                        },
                    });

                    console.log(`Subscription ${subscription.id} cancelled`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing webhook:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to process webhook";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
