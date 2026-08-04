import crypto from "crypto";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const CAPTCHA_TTL_MS = 10 * 60 * 1000;
const CAPTCHA_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "fallback-captcha-secret";
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_BY_IP = 10;
const RATE_LIMIT_MAX_BY_EMAIL = 3;

type CaptchaPayload = {
    answer: number;
    nonce: string;
    expiresAt: number;
};

function getCaptchaSigningKey() {
    return crypto.createHash("sha256").update(CAPTCHA_SECRET).digest();
}

function signCaptchaPayload(payload: CaptchaPayload) {
    return crypto
        .createHmac("sha256", getCaptchaSigningKey())
        .update(JSON.stringify(payload))
        .digest("hex");
}

export function createCaptchaChallenge() {
    const a = crypto.randomInt(2, 10);
    const b = crypto.randomInt(2, 10);
    const operator = crypto.randomInt(0, 2) === 0 ? "+" : "-";
    const answer = operator === "+" ? a + b : a - b;
    const payload: CaptchaPayload = {
        answer,
        nonce: crypto.randomBytes(12).toString("hex"),
        expiresAt: Date.now() + CAPTCHA_TTL_MS,
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = signCaptchaPayload(payload);

    return {
        prompt: `What is ${a} ${operator} ${b}?`,
        token: `${encodedPayload}.${signature}`,
    };
}

export function verifyCaptchaChallenge(token: string, answer: string) {
    if (!token || !answer) return false;

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return false;

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as CaptchaPayload;
        if (signCaptchaPayload(payload) !== signature) return false;
        if (payload.expiresAt < Date.now()) return false;

        return Number.parseInt(answer.trim(), 10) === payload.answer;
    } catch {
        return false;
    }
}

export async function getClientIpAddress() {
    const headerStore = await headers();
    const forwardedFor = headerStore.get("x-forwarded-for");
    const realIp = headerStore.get("x-real-ip");
    return forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
}

export async function checkRegistrationRateLimit(ipAddress: string, email?: string) {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const normalizedEmail = email?.trim().toLowerCase() || undefined;

    const [attemptsByIp, attemptsByEmail] = await Promise.all([
        prisma.registrationAttempt.count({
            where: {
                ipAddress,
                createdAt: { gte: windowStart },
            },
        }),
        normalizedEmail
            ? prisma.registrationAttempt.count({
                where: {
                    email: normalizedEmail,
                    createdAt: { gte: windowStart },
                },
            })
            : Promise.resolve(0),
    ]);

    const blocked = attemptsByIp >= RATE_LIMIT_MAX_BY_IP || attemptsByEmail >= RATE_LIMIT_MAX_BY_EMAIL;

    return {
        blocked,
        attemptsByIp,
        attemptsByEmail,
        retryAfterSeconds: blocked ? Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) : 0,
    };
}

export async function recordRegistrationAttempt(params: {
    ipAddress: string;
    email?: string;
    outcome: "success" | "rate_limited" | "captcha_failed" | "duplicate_email" | "validation_failed" | "honeypot_blocked" | "server_error";
}) {
    await prisma.registrationAttempt.create({
        data: {
            ipAddress: params.ipAddress,
            email: params.email?.trim().toLowerCase() || null,
            outcome: params.outcome,
        },
    });
}
