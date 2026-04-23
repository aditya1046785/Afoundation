"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { CERTIFICATE_CONFIG, getOverlayStyle } from "@/config/certificateConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatCertificateDate } from "@/lib/utils";

function toRgbArray(hex) {
  const cleaned = (hex || "#111827").replace("#", "");
  const full = cleaned.length === 3
    ? cleaned.split("").map((ch) => ch + ch).join("")
    : cleaned;

  const int = Number.parseInt(full, 16);
  if (Number.isNaN(int)) return [17, 24, 39];

  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function fontStyleFromWeight(fontWeight) {
  if (fontWeight >= 700) return "bold";
  return "normal";
}

async function loadImageDataUrl(src) {
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

export default function CertificateGenerator() {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [memberId, setMemberId] = useState("");
  const [customName, setCustomName] = useState("");
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await fetch("/api/members?pageSize=500&isApproved=true");
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to fetch members");

        setMembers(
          (json.data?.members || []).map((item) => ({
            id: item.id,
            name: item.user?.name || "Unknown",
            email: item.user?.email || "",
            memberCode: item.memberId,
          }))
        );
      } catch (error) {
        toast.error(error.message || "Unable to load members");
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, []);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === memberId),
    [members, memberId]
  );

  async function handleGenerateCertificate() {
    const nameFromInput = customName.trim();

    if (!memberId && !nameFromInput) {
      toast.error("Select a member or enter a custom recipient name");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: memberId || undefined,
          recipientName: nameFromInput || undefined,
        }),
      });

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to generate certificate");
      }

      setCertificateData(json.data);
      toast.success("Certificate prepared. It will not be added to member dashboard.");
    } catch (error) {
      toast.error(error.message || "Unable to generate certificate");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!certificateData) return;

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
        // Fallback for missing/invalid background image.
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, widthMm, heightMm, "F");
      }

      const fields = {
        memberName: certificateData.memberName,
        issueDate: `Date: ${formatCertificateDate(certificateData.issueDate)}`,
        certificateNo: `Cert. No: ${certificateData.certificateNo}`,
      };

      Object.entries(fields).forEach(([fieldName, value]) => {
        const cfg = CERTIFICATE_CONFIG.text[fieldName];
        const x = (cfg.leftPercent / 100) * widthMm;
        const y = (cfg.topPercent / 100) * heightMm;
        const maxWidth = (cfg.maxWidthPercent / 100) * widthMm;
        const [r, g, b] = toRgbArray(cfg.color);

        pdf.setFont(cfg.pdfFontFamily || "times", cfg.pdfFontStyle || fontStyleFromWeight(cfg.fontWeight));
        pdf.setFontSize(cfg.pdfFontSizePt || Math.round(cfg.fontSizePx * 0.75));
        pdf.setTextColor(r, g, b);

        const options = {
          align: cfg.textAlign,
          maxWidth,
        };

        pdf.text(String(value), x, y, options);
      });

      pdf.save(`Certificate-${certificateData.certificateNo}.pdf`);
      toast.success("Certificate PDF downloaded");
    } catch (error) {
      toast.error(error.message || "Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Generate Certificate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Member (Optional)</Label>
              <Select value={memberId} onValueChange={setMemberId} disabled={loadingMembers}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingMembers ? "Loading members..." : "Select a member"} />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.memberCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Selected Member Email</Label>
              <Input value={selectedMember?.email || "-"} readOnly className="bg-slate-50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Or Type Custom Recipient Name</Label>
            <Input
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Type any name for one-time certificate (not linked to member dashboard)"
            />
            <p className="text-xs text-slate-500">
              If this is filled, the certificate will use this name directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleGenerateCertificate} disabled={generating} className="bg-emerald-700 hover:bg-emerald-800">
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Certificate
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={!certificateData || downloading}
            >
              {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {certificateData && (
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Certificate Preview</CardTitle>
          </CardHeader>
          <CardContent>
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
                <div style={getOverlayStyle(CERTIFICATE_CONFIG.text.memberName)}>
                  {certificateData.memberName}
                </div>
                <div style={getOverlayStyle(CERTIFICATE_CONFIG.text.issueDate)}>
                  {`Date: ${formatCertificateDate(certificateData.issueDate)}`}
                </div>
                <div style={getOverlayStyle(CERTIFICATE_CONFIG.text.certificateNo)}>
                  {`Cert. No: ${certificateData.certificateNo}`}
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <p><span className="font-semibold">Certificate No:</span> {certificateData.certificateNo}</p>
              <p><span className="font-semibold">Date:</span> {formatCertificateDate(certificateData.issueDate)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
