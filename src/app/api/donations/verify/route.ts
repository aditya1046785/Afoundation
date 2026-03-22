import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendDonationReceiptEmail } from "@/lib/email";

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

        // Update donation record
        const donationRecord = await prisma.donation.findFirst({
            where: { razorpayOrderId: razorpay_order_id },
        });

        if (!donationRecord) {
            return NextResponse.json({ success: false, error: "Donation not found" }, { status: 404 });
        }

        const donation = await prisma.donation.update({
            where: { id: donationRecord.id },
            data: {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: "COMPLETED",
                paidAt: new Date(),
            },
        });

        // Send receipt email
        await sendDonationReceiptEmail(donation.donorEmail, {
            donorName: donation.donorName,
            amount: donation.amount,
            receiptNumber: donation.receiptNumber,
            date: donation.paidAt!.toISOString(),
            purpose: donation.purpose || "General Donation",
            transactionId: razorpay_payment_id,
        });

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully",
            data: { receiptNumber: donation.receiptNumber, donationId: donation.id },
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
    }
}
