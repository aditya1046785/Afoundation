import { NextResponse } from "next/server";
import { createCaptchaChallenge } from "@/lib/security";

export async function GET() {
    const challenge = createCaptchaChallenge();
    return NextResponse.json({ success: true, data: challenge });
}
