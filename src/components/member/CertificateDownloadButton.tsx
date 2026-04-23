"use client";

import { jsPDF } from "jspdf";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CERTIFICATE_CONFIG } from "@/config/certificateConfig";
import { formatCertificateDate } from "@/lib/utils";

type Props = {
    certificateNo: string;
    memberName: string;
    issueDate: string;
};

function toRgbArray(hex: string): [number, number, number] {
    const cleaned = (hex || "#111827").replace("#", "");
    const full = cleaned.length === 3
        ? cleaned.split("").map((ch) => ch + ch).join("")
        : cleaned;

    const int = Number.parseInt(full, 16);
    if (Number.isNaN(int)) return [17, 24, 39];

    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function fontStyleFromWeight(fontWeight: number) {
    return fontWeight >= 700 ? "bold" : "normal";
}

async function loadImageDataUrl(src: string): Promise<string> {
    return await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Unable to prepare certificate image"));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => reject(new Error(`Unable to load image: ${src}`));
        img.src = src;
    });
}

export function CertificateDownloadButton({ certificateNo, memberName, issueDate }: Props) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });

            const widthMm = CERTIFICATE_CONFIG.page.widthMm;
            const heightMm = CERTIFICATE_CONFIG.page.heightMm;

            try {
                const bg = await loadImageDataUrl(CERTIFICATE_CONFIG.backgroundImage);
                pdf.addImage(bg, "PNG", 0, 0, widthMm, heightMm);
            } catch {
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, 0, widthMm, heightMm, "F");
            }

            const fields = {
                memberName,
                issueDate: `Date: ${formatCertificateDate(issueDate)}`,
                certificateNo: `Cert. No: ${certificateNo}`,
            } as const;

            Object.entries(fields).forEach(([fieldName, value]) => {
                const cfg = CERTIFICATE_CONFIG.text[fieldName as keyof typeof CERTIFICATE_CONFIG.text];
                const x = (cfg.leftPercent / 100) * widthMm;
                const y = (cfg.topPercent / 100) * heightMm;
                const maxWidth = (cfg.maxWidthPercent / 100) * widthMm;
                const [r, g, b] = toRgbArray(cfg.color);

                pdf.setFont(cfg.pdfFontFamily || "times", cfg.pdfFontStyle || fontStyleFromWeight(cfg.fontWeight));
                pdf.setFontSize(cfg.pdfFontSizePt || Math.round(cfg.fontSizePx * 0.75));
                pdf.setTextColor(r, g, b);
                const align = cfg.textAlign as "left" | "center" | "right" | "justify";
                pdf.text(String(value), x, y, {
                    align,
                    maxWidth,
                });
            });

            const blob = pdf.output("blob");
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, "_blank", "noopener,noreferrer");

            // Revoke later to avoid leaking object URLs while still allowing viewer load.
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        } catch (error) {
            console.error(error);
            toast.error("Unable to download certificate PDF");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shadow-none border border-emerald-200/50 rounded-xl px-4 font-semibold transition-colors"
        >
            {downloading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
            PDF
        </Button>
    );
}
