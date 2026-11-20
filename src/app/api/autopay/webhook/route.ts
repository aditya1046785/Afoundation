import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import {
    AUTOPAY_STATUS_TRANSITIONS,
    getAllowedFromStates,
} from "@/lib/state-transitions";

type RazorpayWebhookPayload = {
    event?: string;
    event_id?: string;
    payload?: {
        subscription?: {
            entity?: {
                id?: string;
            };
        };
        payment?: {
            entity?: {
                id?: string;
            };
        };
    };
};

// POST — Handle Razorpay webhooks for autopay subscriptions
export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json(
                { success: false, error: "Missing signature" },
                { status: 400 }
            );
        }

        // 3.a: Raw body se HMAC signature verify karo PEHLE, JSON.parse baad me. Signature fail → 400.
        const rawBody = await request.text();
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
            return NextResponse.json(
                { success: false, error: "Webhook secret not configured" },
                { status: 500 }
            );
        }

        const hmac = crypto.createHmac("sha256", webhookSecret);
        hmac.update(rawBody);
        const generatedSignature = hmac.digest("hex");

        let isValidSignature = false;
        try {
            isValidSignature = crypto.timingSafeEqual(
                Buffer.from(generatedSignature),
                Buffer.from(signature)
            );
        } catch {
            isValidSignature = false;
        }

        if (!isValidSignature) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 400 }
            );
        }

        // Parse JSON AFTER signature verification
        let body: RazorpayWebhookPayload;
        try {
            body = JSON.parse(rawBody) as RazorpayWebhookPayload;
        } catch (parseError) {
            console.error("Invalid JSON in webhook payload:", parseError);
            return NextResponse.json(
                { success: false, error: "Invalid JSON" },
                { status: 400 }
            );
        }

        // 3.b: x-razorpay-event-id header se eventId lo
        const eventId = request.headers.get("x-razorpay-event-id") || body?.event_id;
        const event = body?.event;
        const eventData = body?.payload;

        console.log(`[Webhook] Processing event: ${event} (Event ID: ${eventId})`);

        // Fast-path duplicate check
        if (eventId) {
            const existingEvent = await prisma.webhookEvent.findUnique({
                where: { eventId },
                select: { id: true },
            });
            if (existingEvent) {
                console.log(`[Webhook] Duplicate event already processed: ${eventId}`);
                return NextResponse.json({ success: true, message: "Duplicate event already processed" });
            }
        }

        let sideEffect: (() => Promise<void>) | null = null;

        // 3.d: Event create + status update ek prisma.$transaction me karo
        try {
            await prisma.$transaction(async (tx) => {
                // Record eventId for idempotency
                if (eventId) {
                    await tx.webhookEvent.create({
                        data: {
                            eventId,
                            type: event || "unknown",
                        },
                    });
                }

                switch (event) {
                    case "subscription.activated":
                    case "subscription.resumed": {
                        const subscriptionId = eventData?.subscription?.entity?.id;
                        if (!subscriptionId) break;

                        // 3.c: Status update updateMany se karo with allowedFromStates
                        const allowedFromStates = getAllowedFromStates(AUTOPAY_STATUS_TRANSITIONS, "ACTIVE");
                        const result = await tx.autopaySubscription.updateMany({
                            where: {
                                razorpaySubscriptionId: subscriptionId,
                                status: { in: allowedFromStates },
                            },
                            data: {
                                status: "ACTIVE",
                            },
                        });

                        if (result.count === 0) {
                            console.log(`[Webhook] Subscription ${subscriptionId} transition to ACTIVE ignored (current status not in [${allowedFromStates.join(", ")}])`);
                        } else {
                            console.log(`[Webhook] Subscription ${subscriptionId} activated`);
                        }
                        break;
                    }

                    case "subscription.paused": {
                        const subscriptionId = eventData?.subscription?.entity?.id;
                        if (!subscriptionId) break;

                        const allowedFromStates = getAllowedFromStates(AUTOPAY_STATUS_TRANSITIONS, "PAUSED");
                        const result = await tx.autopaySubscription.updateMany({
                            where: {
                                razorpaySubscriptionId: subscriptionId,
                                status: { in: allowedFromStates },
                            },
                            data: {
                                status: "PAUSED",
                            },
                        });

                        if (result.count === 0) {
                            console.log(`[Webhook] Subscription ${subscriptionId} transition to PAUSED ignored (current status not in [${allowedFromStates.join(", ")}])`);
                        } else {
                            console.log(`[Webhook] Subscription ${subscriptionId} paused`);
                        }
                        break;
                    }

                    case "subscription.cancelled": {
                        const subscriptionId = eventData?.subscription?.entity?.id;
                        if (!subscriptionId) break;

                        const allowedFromStates = getAllowedFromStates(AUTOPAY_STATUS_TRANSITIONS, "CANCELLED");
                        const result = await tx.autopaySubscription.updateMany({
                            where: {
                                razorpaySubscriptionId: subscriptionId,
                                status: { in: allowedFromStates },
                            },
                            data: {
                                status: "CANCELLED",
                                endDate: new Date(),
                            },
                        });

                        if (result.count === 0) {
                            console.log(`[Webhook] Subscription ${subscriptionId} transition to CANCELLED ignored (current status not in [${allowedFromStates.join(", ")}])`);
                        } else {
                            console.log(`[Webhook] Subscription ${subscriptionId} cancelled`);
                        }
                        break;
                    }

                    case "subscription.charged": {
                        const subscriptionId = eventData?.subscription?.entity?.id;
                        const paymentId = eventData?.payment?.entity?.id;

                        if (!subscriptionId || !paymentId) break;

                        const subscription = await tx.autopaySubscription.findFirst({
                            where: { razorpaySubscriptionId: subscriptionId },
                        });

                        if (!subscription) {
                            console.warn(`[Webhook] Subscription not found for razorpay ID: ${subscriptionId}`);
                            break;
                        }

                        // Guard: if subscription is CANCELLED, do not process charges
                        if (subscription.status === "CANCELLED") {
                            console.log(`[Webhook] Subscription ${subscriptionId} is CANCELLED. Charge processing ignored.`);
                            break;
                        }

                        // 3.c: Update metrics only if subscription is in an active/paused state
                        const updateResult = await tx.autopaySubscription.updateMany({
                            where: {
                                razorpaySubscriptionId: subscriptionId,
                                status: { in: ["ACTIVE", "PAUSED"] },
                            },
                            data: {
                                paymentsMade: { increment: 1 },
                                totalAmountCollected: { increment: subscription.amount },
                                lastPaymentDate: new Date(),
                                nextPaymentDate: new Date(Date.now() + (subscription.frequency === "WEEKLY" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
                            },
                        });

                        // 5: Koi bhi side-effect (email, receipt generation) sirf tab chalao jab updateMany ne count ≥ 1 diya
                        if (updateResult.count >= 1) {
                            // Check for duplicate donation record
                            const existingDonation = await tx.donation.findFirst({
                                where: { razorpayPaymentId: paymentId },
                                select: { id: true },
                            });

                            if (!existingDonation) {
                                const donationCount = await tx.donation.count();
                                const { generateReceiptNumber } = await import("@/lib/utils");
                                const receiptNumber = generateReceiptNumber(donationCount);

                                await tx.donation.create({
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
                                        notes: `Autopay subscription #${subscription.id} - Payment #${subscription.paymentsMade + 1}`,
                                    },
                                });

                                sideEffect = async () => {
                                    try {
                                        const { sendDonationReceiptEmail } = await import("@/lib/email");
                                        await sendDonationReceiptEmail(subscription.donorEmail, {
                                            donorName: subscription.donorName,
                                            amount: subscription.amount,
                                            receiptNumber,
                                            date: new Date().toISOString(),
                                            purpose: subscription.purpose || "Autopay Donation",
                                            transactionId: paymentId,
                                        });
                                    } catch (emailErr) {
                                        console.error("[Webhook] Failed to send receipt email:", emailErr);
                                    }
                                };

                                console.log(`[Webhook] Payment processed for subscription ${subscription.id}`);
                            }
                        } else {
                            console.log(`[Webhook] Subscription ${subscriptionId} charge update skipped (count: 0)`);
                        }
                        break;
                    }

                    case "subscription.failed": {
                        console.warn(`[Webhook] Payment failed for subscription ${eventData?.subscription?.entity?.id}`);
                        break;
                    }

                    default:
                        // 3.e: Unknown event types pe bhi 200 return karo, bas log karo
                        console.log(`[Webhook] Unhandled/unknown event type: ${event}`);
                }
            });

            // Run side effect outside transaction
            if (typeof sideEffect === "function") {
                await (sideEffect as () => Promise<void>)();
            }

            return NextResponse.json({ success: true });
        } catch (txError: unknown) {
            const err = txError as { code?: string; message?: string };
            // 3.b: Unique violation (P2002) aaye to duplicate hai → turant 200 return karo
            if (
                err?.code === "P2002" ||
                err?.message?.includes("Unique constraint failed") ||
                err?.message?.includes("P2002")
            ) {
                console.log(`[Webhook] Duplicate eventId ignored via P2002: ${eventId}`);
                return NextResponse.json({ success: true, message: "Duplicate event already processed" });
            }

            console.error("[Webhook] Transaction error:", txError);
            return NextResponse.json(
                { success: false, error: "Failed to process webhook" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process webhook" },
            { status: 500 }
        );
    }
}
