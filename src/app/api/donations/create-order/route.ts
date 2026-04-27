import { NextRequest, NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { donationSchema } from "@/lib/validations";
import { generateReceiptNumber } from "@/lib/utils";

type CrowdfundingMeta = {
    donationType: "crowdfunding";
    crowdfundingCampaignId: string;
    crowdfundingCampaignTitle: string;
};

// POST — Create a Razorpay order for donation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = donationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });
        }

        const {
            amount,
            donorName,
            donorEmail,
            donorPhone,
            donorPAN,
            purpose,
            message,
            referralCode,
            donationType,
            crowdfundingCampaignId,
            crowdfundingCampaignTitle,
        } = validation.data;

        let crowdfundingMeta: CrowdfundingMeta | null = null;
        let finalPurpose = purpose;

        if (donationType === "crowdfunding" && crowdfundingCampaignId) {
            const campaign = await prisma.crowdfundingCampaign.findFirst({
                where: { id: crowdfundingCampaignId, isActive: true },
                select: { id: true, title: true },
            });

            if (!campaign) {
                return NextResponse.json({ success: false, error: "Selected crowdfunding campaign is not available" }, { status: 400 });
            }

            const campaignTitle = crowdfundingCampaignTitle?.trim() || campaign.title;
            crowdfundingMeta = {
                donationType: "crowdfunding",
                crowdfundingCampaignId: campaign.id,
                crowdfundingCampaignTitle: campaignTitle,
            };
            finalPurpose = `Crowdfunding - ${campaignTitle}`;
        }

        // Generate unique receipt number
        const donationCount = await prisma.donation.count();
        const receiptNumber = generateReceiptNumber(donationCount);

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: receiptNumber,
            notes: {
                donorName,
                donorEmail,
                purpose: finalPurpose || "General Donation",
                donationType: crowdfundingMeta?.donationType || "general",
                crowdfundingCampaignId: crowdfundingMeta?.crowdfundingCampaignId || "",
            },
        });

        // Find member if email matches (self donation tracking)
        const member = await prisma.member.findFirst({
            where: { user: { email: donorEmail } },
        });

        // Resolve referral member from shared member code.
        let referrerMemberId: string | null = null;
        if (referralCode) {
            const referrer = await prisma.member.findUnique({
                where: { memberId: referralCode },
                select: { id: true },
            });

            // Prevent self-referral if donor is an existing member.
            if (referrer && referrer.id !== member?.id) {
                referrerMemberId = referrer.id;
            }
        }

        // Create a PENDING donation record
        const donation = await prisma.donation.create({
            data: {
                amount,
                currency: "INR",
                donorName,
                donorEmail,
                donorPhone,
                donorPAN,
                memberId: member?.id || null,
                referrerMemberId,
                razorpayOrderId: order.id,
                receiptNumber,
                purpose: finalPurpose,
                message,
                notes: crowdfundingMeta ? JSON.stringify(crowdfundingMeta) : null,
                status: "PENDING",
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                donationId: donation.id,
                receiptNumber,
            },
        });
    } catch (error) {
        console.error("Create order error:", error);
        return NextResponse.json({ success: false, error: "Failed to create order." }, { status: 500 });
    }
}
