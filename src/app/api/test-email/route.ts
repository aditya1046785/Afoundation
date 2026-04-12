import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");
const FROM = process.env.EMAIL_FROM || "Nirashray Foundation <onboarding@resend.dev>";

export async function POST(request: NextRequest) {
    try {
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { success: false, error: "RESEND_API_KEY is not configured." },
                { status: 500 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const to = String(body.to || "").trim();
        const subject = String(body.subject || "Nirashray Foundation email test");
        const name = String(body.name || "Test User").trim();

        if (!to) {
            return NextResponse.json(
                { success: false, error: "Recipient email is required." },
                { status: 400 }
            );
        }

        const result = await resend.emails.send({
            from: FROM,
            to,
            subject,
            text: `Hello ${name},\n\nThis is a test email from Nirashray Foundation.\n\nIf you received this, Resend is working correctly.`,
            html: `<p>Hello ${name},</p><p>This is a test email from Nirashray Foundation.</p><p>If you received this, Resend is working correctly.</p>`,
        });

        return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Test email failed:", error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}