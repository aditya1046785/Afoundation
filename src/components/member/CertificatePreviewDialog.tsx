"use client";

import { Eye } from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CERTIFICATE_CONFIG, getOverlayStyle } from "@/config/certificateConfig";
import { formatCertificateDate } from "@/lib/utils";

type Props = {
    certificateNo: string;
    memberName: string;
    issueDate: string;
};

export function CertificatePreviewDialog({ certificateNo, memberName, issueDate }: Props) {
    const memberNameStyle = getOverlayStyle(CERTIFICATE_CONFIG.text.memberName) as CSSProperties;
    const issueDateStyle = getOverlayStyle(CERTIFICATE_CONFIG.text.issueDate) as CSSProperties;
    const certificateNoStyle = getOverlayStyle(CERTIFICATE_CONFIG.text.certificateNo) as CSSProperties;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="rounded-xl px-4 border-slate-300 text-slate-700">
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[96vw] w-300 p-4 sm:p-5" showCloseButton>
                <DialogHeader>
                    <DialogTitle>Certificate Preview</DialogTitle>
                    <DialogDescription>
                        {certificateNo} | {formatCertificateDate(issueDate)}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div
                        className="relative mx-auto w-full bg-white"
                        style={{
                            maxWidth: `${CERTIFICATE_CONFIG.preview.maxWidthPx}px`,
                            aspectRatio: `${CERTIFICATE_CONFIG.page.aspectRatio}`,
                            backgroundImage: `url(${CERTIFICATE_CONFIG.backgroundImage})`,
                            backgroundSize: "100% 100%",
                            backgroundPosition: "top left",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <div style={memberNameStyle}>{memberName}</div>
                        <div style={issueDateStyle}>{`Date: ${formatCertificateDate(issueDate)}`}</div>
                        <div style={certificateNoStyle}>{`Cert. No: ${certificateNo}`}</div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
