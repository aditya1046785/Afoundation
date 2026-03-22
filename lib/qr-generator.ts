/**
 * QR Code generation utility using the 'qrcode' library
 * Generates QR codes as data URLs (base64)
 */

/**
 * Generate a QR code data URL for a member verification
 */
export async function generateMemberQRCode(
    memberId: string,
    memberName: string
): Promise<string> {
    const QRCode = await import("qrcode");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const data = JSON.stringify({
        type: "MEMBER_VERIFY",
        id: memberId,
        name: memberName,
        org: "Nirashray Foundation",
        url: `${appUrl}/verify/${memberId}`,
    });

    return QRCode.toDataURL(data, {
        errorCorrectionLevel: "H",
        width: 300,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
    });
}

/**
 * Generate a QR code data URL for a certificate verification
 */
export async function generateCertificateQRCode(certNo: string): Promise<string> {
    const QRCode = await import("qrcode");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const data = JSON.stringify({
        type: "CERT_VERIFY",
        certNo,
        org: "Nirashray Foundation",
        url: `${appUrl}/verify/cert/${certNo}`,
    });

    return QRCode.toDataURL(data, {
        errorCorrectionLevel: "H",
        width: 300,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
    });
}
