import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { getSiteSettings } from "@/lib/site-settings";

export type ReceiptPdfData = {
    receiptNumber: string;
    donorName: string;
    donorEmail: string;
    donorPhone?: string | null;
    donorPAN?: string | null;
    amount: number;
    purpose?: string | null;
    transactionId?: string | null;
    date: Date;
};

export async function generateReceiptPdfBuffer(receiptData: ReceiptPdfData): Promise<Buffer> {
    const { jsPDF } = await import("jspdf");
    const settings = await getSiteSettings([
        "site_name",
        "site_tagline",
        "contact_address",
        "address_line1",
        "address_line2",
        "contact_phone",
        "contact_email",
        "registration_number",
        "80g_registration_number",
    ]);

    const organizationName = settings.site_name?.trim() || "Nirashray Foundation";
    const organizationTagline = settings.site_tagline?.trim() || "Empowering Lives, Building Hope";
    const registeredOffice = "Asrhi Lalganj-ajhara Pratapgarh UP 230132"; /*settings.contact_address?.trim() || [settings.address_line1?.trim(), settings.address_line2?.trim()].filter(Boolean).join(" ") */
    const contactPhone = settings.contact_phone?.trim() || "";
    const contactEmail = settings.contact_email?.trim() || "";
    const registrationNumber = settings.registration_number?.trim() || "";
    const eightGNumber = "U94990UP2025NPL218986";

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(30, 64, 175);
    pdf.rect(0, 0, pageWidth, 40, "F");

    // Try rendering the foundation logo in the header; fallback to a branded badge.
    const logoSize = 16;
    const logoX = 10;
    const logoY = 8;

    try {
        const logoPath = path.join(process.cwd(), "public", "favicon.ico");
        const logoBuffer = await readFile(logoPath);
        const logoDataUrl = `data:image/x-icon;base64,${logoBuffer.toString("base64")}`;
        pdf.addImage(logoDataUrl, "ICO", logoX, logoY, logoSize, logoSize);
    } catch {
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(logoX, logoY, logoSize, logoSize, 2, 2, "F");
        pdf.setTextColor(30, 64, 175);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("NF", logoX + logoSize / 2, logoY + 10, { align: "center" });
    }

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(organizationName.toUpperCase(), pageWidth / 2, 18, { align: "center" });
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(organizationTagline, pageWidth / 2, 27, { align: "center" });
    pdf.setFontSize(9);
    pdf.text("Registered under Company Registration Act", pageWidth / 2, 35, { align: "center" });

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("DONATION RECEIPT", pageWidth / 2, 55, { align: "center" });

    pdf.setTextColor(75, 85, 99);
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    const centerInfoLine = (label: string, value: string, y: number) => {
        if (!value) return;
        pdf.text(`${label}: ${value}`, pageWidth / 2, y, { align: "center", maxWidth: pageWidth - 30 });
    };

    centerInfoLine("Registered Office", registeredOffice, 61);
    centerInfoLine("Contact", contactPhone, 66);
    centerInfoLine("Email", contactEmail, 71);
    centerInfoLine("Registration No.", registrationNumber, 76);
    centerInfoLine("80G Reg. No.", eightGNumber, 81);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Receipt No: ${receiptData.receiptNumber}`, 20, 89);
    pdf.text(
        `Date: ${receiptData.date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
        pageWidth - 20,
        89,
        { align: "right" }
    );

    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(0.5);
    pdf.line(20, 95, pageWidth - 20, 95);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Donor Information", 20, 107);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    let y = 117;

    const addRow = (label: string, value: string) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(`${label}:`, 20, y);
        pdf.setFont("helvetica", "normal");
        pdf.text(value, 80, y);
        y += 10;
    };

    addRow("Donor Name", receiptData.donorName);
    addRow("Email", receiptData.donorEmail);
    if (receiptData.donorPhone) addRow("Phone", receiptData.donorPhone);
    if (receiptData.donorPAN) addRow("PAN Number", receiptData.donorPAN);
    if (receiptData.transactionId) addRow("Transaction ID", receiptData.transactionId);
    if (receiptData.purpose) addRow("Purpose", receiptData.purpose);

    y += 5;
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(20, y, pageWidth - 40, 25, 2, 2, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(30, 64, 175);
    pdf.text("Amount Donated:", 30, y + 10);

    pdf.setFontSize(16);
    pdf.text(`INR ${receiptData.amount.toLocaleString("en-IN")}`, pageWidth / 2 + 20, y + 14, { align: "center" });

    y += 40;
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.text(
        "This receipt is valid for claiming tax exemption under Section 80G of the Income Tax Act, 1961.",
        pageWidth / 2,
        y,
        { align: "center", maxWidth: pageWidth - 40 }
    );

    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(0.5);
    pdf.line(20, pageHeight - 40, pageWidth - 20, pageHeight - 40);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Authorized Signatory", 20, pageHeight - 28);
    pdf.text("Nirashray Foundation", 20, pageHeight - 20);
    pdf.text("Thank you for your generous contribution!", pageWidth / 2, pageHeight - 15, { align: "center" });

    const bytes = pdf.output("arraybuffer");
    return Buffer.from(bytes);
}
