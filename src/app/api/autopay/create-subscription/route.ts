import { NextRequest, NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { autopaySchema } from "@/lib/validations";

// Helper to promisify Razorpay methods
const promisify = <T,>(fn: any, context: any) => {
    return (...args: any[]): Promise<T> =>
        new Promise((resolve, reject) => {
            fn.apply(context, [
                ...args,
                (err: any, data: any) => {
                    if (err) reject(err);
                    else resolve(data as T);
                },
            ]);
        });
};

interface RazorpayCustomer {
    id: string;
    email: string;
    contact: string;
    name: string;
    [key: string]: any;
}

interface RazorpayPlan {
    id: string;
    period: string;
    interval: number;
    [key: string]: any;
}

interface RazorpaySubscription {
    id: string;
    start_at: number;
    [key: string]: any;
}

function getErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null) {
        const maybeError = error as {
            error?: { description?: string; message?: string };
            message?: string;
        };

        return (
            maybeError.error?.description ||
            maybeError.error?.message ||
            maybeError.message ||
            "Failed to create subscription"
        );
    }

    return "Failed to create subscription";
}

// POST — Create a Razorpay subscription for autopay
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = autopaySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.issues[0]?.message },
                { status: 400 }
            );
        }

        const {
            amount,
            frequency,
            donorName,
            donorEmail,
            donorPhone,
            donorPAN,
            purpose,
            message,
            referralCode,
        } = validation.data;

        // Create or fetch Razorpay Customer
        const createCustomer = promisify<RazorpayCustomer>(razorpay.customers.create, razorpay.customers);
        const customer = await createCustomer({
            email: donorEmail,
            contact: donorPhone,
            name: donorName,
        });
        const customerId = customer.id;

        // Convert frequency to Razorpay interval
        const interval = frequency === "WEEKLY"
            ? "weekly"
            : frequency === "MONTHLY"
                ? "monthly"
                : "yearly";

        // Create a Razorpay Plan
        const createPlan = promisify<RazorpayPlan>(razorpay.plans.create, razorpay.plans);
        const plan = await createPlan({
            period: interval,
            interval: 1,
            item: {
                amount: amount * 100, // Convert to paise
                currency: "INR",
                name: `${frequency === "WEEKLY" ? "Weekly" :frequency==="MONTHLY" ? "Monthly" : "Yearly"} Donation`,
                description: `Donation to Nirashray Foundation${purpose ? ` - ${purpose}` : ""
                    }`,
            },
        });

        // Resolve referral member
        let referrerMemberId: string | null = null;
        if (referralCode) {
            const referrer = await prisma.member.findUnique({
                where: { memberId: referralCode },
                select: { id: true },
            });

            if (referrer) {
                referrerMemberId = referrer.id;
            }
        }

        // Find member if email matches
        const member = await prisma.member.findFirst({
            where: { user: { email: donorEmail } },
        });

        // Create Razorpay Subscription
        const createSubscription = promisify<RazorpaySubscription>(
            razorpay.subscriptions.create,
            razorpay.subscriptions
        );
        const subscription = await createSubscription({
            plan_id: plan.id,
            customer_id: customerId,
            quantity: 1,
            total_count: 1200,
            start_at: Math.floor(Date.now() / 1000) + 3600, // Start 1 hour from now
            notes: {
                donorName,
                donorEmail,
                purpose: purpose || "General Donation",
                frequency,
            },
        });

        // Create AutopaySubscription record in database
        const autopaySubscription = await prisma.autopaySubscription.create({
            data: {
                donorName,
                donorEmail,
                donorPhone,
                donorPAN,
                amount,
                frequency: frequency as "WEEKLY" | "MONTHLY",
                currency: "INR",
                purpose,
                message,
                memberId: member?.id || null,
                referrerMemberId,
                referralCodeUsed: referralCode,
                razorpayCustomerId: customerId,
                razorpaySubscriptionId: subscription.id,
                razorpayPlanId: plan.id,
                status: "ACTIVE",
                nextPaymentDate: new Date((subscription.start_at || Math.floor(Date.now() / 1000) + 3600) * 1000),
            },
        });

        console.log("AutopaySubscription created:", autopaySubscription);

        return NextResponse.json({
            success: true,
            data: {
                subscriptionId: autopaySubscription.id,
                razorpaySubscriptionId: subscription.id,
                amount,
                frequency,
            },
        });
    } catch (error) {
        console.error("Error creating autopay subscription:", error);
        const errorMessage = getErrorMessage(error);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
