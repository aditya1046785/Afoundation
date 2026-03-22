import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "dummy_key_id",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret",
});

export default razorpayInstance;

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const crypto = require("crypto");
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");
    return expectedSignature === signature;
}
