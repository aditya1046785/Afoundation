/**
 * PDF generation utilities using html2canvas + jsPDF
 * All PDF generation is done client-side
 */

type MemberIDCardPDFData = {
    memberName: string;
    memberEmail: string;
    memberId: string;
    membershipType: string;
    cardNumber: string;
    joinDate: string;
    expiryDate: string;
    qrCodeData?: string | null;
    initials?: string;
};

function sanitizeFileName(value: string): string {
    return value
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "member-id-card";
}

function getInitialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "M";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Download ID card as PDF
 * Captures a DOM element and converts to PDF
 */
export async function downloadIDCardPDF(elementId: string, memberName: string): Promise<void> {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const element = document.getElementById(elementId);
    if (!element) throw new Error("Element not found");

    const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    // ID card dimensions: 85.6mm x 53.98mm (landscape)
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [85.6, 53.98] });
    pdf.addImage(imgData, "PNG", 0, 0, 85.6, 53.98);
    pdf.save(`ID-Card-${memberName.replace(/\s+/g, "-")}.pdf`);
}

/**
 * Download member ID card as PDF.
 *
 * This avoids html2canvas so the export does not break on modern CSS color
 * functions such as lab()/oklch() used elsewhere in the app.
 */
export async function downloadMemberIDCardPDF(data: MemberIDCardPDFData): Promise<void> {
    const { jsPDF } = await import("jspdf");

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [54, 86] });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const orange: [number, number, number] = [249, 115, 22];
    const orangeSoft: [number, number, number] = [254, 215, 170];
    const dark: [number, number, number] = [15, 23, 42];
    const slate: [number, number, number] = [100, 116, 139];
    const light: [number, number, number] = [248, 250, 252];
    const border: [number, number, number] = [229, 231, 235];

    const badgeText = data.membershipType?.trim() || "MEMBER";
    const initials = (data.initials || getInitialsFromName(data.memberName)).toUpperCase();
    const safeFileName = sanitizeFileName(data.memberName);

    const nameFontSize = Math.max(8.8, Math.min(11.5, 12.5 - Math.max(0, data.memberName.length - 14) * 0.18));
    const emailFontSize = Math.max(4.6, Math.min(5.4, 5.4 - Math.max(0, data.memberEmail.length - 20) * 0.02));

    // Card background and border
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setDrawColor(...orange);
    pdf.setLineWidth(1.2);
    pdf.roundedRect(1.3, 1.3, pageWidth - 2.6, pageHeight - 2.6, 3, 3, "S");

    // Header
    pdf.setFillColor(...dark);
    pdf.roundedRect(2.2, 2.2, pageWidth - 4.4, 14.5, 3, 3, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.4);
    pdf.text("NIRASHRAY FOUNDATION", pageWidth / 2, 8.0, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(4.5);
    pdf.setTextColor(203, 213, 225);
    pdf.text("Official Member Identity Card", pageWidth / 2, 12.8, { align: "center" });

    // Membership badge
    pdf.setFillColor(251, 146, 60);
    const badgeWidth = Math.min(Math.max(pdf.getTextWidth(badgeText) + 7, 17), pageWidth - 12);
    const badgeX = (pageWidth - badgeWidth) / 2;
    pdf.roundedRect(badgeX, 16.4, badgeWidth, 4.4, 2.2, 2.2, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4.2);
    pdf.text(badgeText.toUpperCase(), pageWidth / 2, 19.4, { align: "center" });

    // Avatar
    pdf.setFillColor(...orangeSoft);
    pdf.circle(pageWidth / 2, 33.0, 9.8, "F");
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(1.0);
    pdf.circle(pageWidth / 2, 33.0, 9.8, "S");
    pdf.setTextColor(124, 45, 18);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(initials, pageWidth / 2, 36.8, { align: "center" });

    // Name and email
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(nameFontSize);
    pdf.text(data.memberName, pageWidth / 2, 45.2, { align: "center", maxWidth: pageWidth - 8 });

    pdf.setTextColor(...slate);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(emailFontSize);
    pdf.text(data.memberEmail, pageWidth / 2, 49.4, { align: "center", maxWidth: pageWidth - 8 });

    // Details panel
    pdf.setFillColor(...light);
    pdf.setDrawColor(...border);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(3.5, 52.8, pageWidth - 7, 14.8, 2.5, 2.5, "FD");

    const labelColor: [number, number, number] = [107, 114, 128];
    const valueColor: [number, number, number] = [17, 24, 39];
    const detailLeftX = 5.0;
    const detailRightX = 29.0;
    const labelSize = 4.0;
    const valueSize = 5.1;

    const writeDetail = (x: number, y: number, label: string, value: string) => {
        pdf.setTextColor(...labelColor);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(labelSize);
        pdf.text(label.toUpperCase(), x, y);
        pdf.setTextColor(...valueColor);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(valueSize);
        pdf.text(value, x, y + 3.8, { maxWidth: 19.0 });
    };

    writeDetail(detailLeftX, 56.8, "Member ID", data.memberId);
    writeDetail(detailRightX, 56.8, "Card No", data.cardNumber);
    writeDetail(detailLeftX, 62.0, "Joined", data.joinDate);
    writeDetail(detailRightX, 62.0, "Valid Until", data.expiryDate);

    // QR section
    pdf.setTextColor(55, 65, 81);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4.4);
    pdf.text("Scan to verify membership", pageWidth / 2, 68.8, { align: "center" });

    if (data.qrCodeData) {
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(...border);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(20.8, 69.6, 12.4, 12.4, 1.4, 1.4, "FD");
        try {
            pdf.addImage(data.qrCodeData, "PNG", 21.4, 70.2, 11.2, 11.2);
        } catch {
            pdf.setTextColor(...slate);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(4.0);
            pdf.text("QR unavailable", pageWidth / 2, 75.8, { align: "center" });
        }
    } else {
        pdf.setTextColor(...slate);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(4.0);
        pdf.text("QR unavailable", pageWidth / 2, 75.8, { align: "center" });
    }

    // Footer
    pdf.setDrawColor(...border);
    pdf.setLineWidth(0.3);
    pdf.line(6, pageHeight - 5.0, pageWidth - 6, pageHeight - 5.0);
    pdf.setTextColor(...slate);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4.1);
    pdf.text("Digital Member Identity Card", pageWidth / 2, pageHeight - 1.8, { align: "center" });

    pdf.save(`ID-Card-${safeFileName}.pdf`);
}

/**
 * Download certificate as PDF (A4 landscape)
 */
export async function downloadCertificatePDF(
    elementId: string,
    certNo: string
): Promise<void> {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const element = document.getElementById(elementId);
    if (!element) throw new Error("Element not found");

    const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Certificate-${certNo}.pdf`);
}

/**
 * Download donation receipt as PDF (A4 portrait)
 */
export async function downloadReceiptPDF(
    receiptData: {
        receiptNumber: string;
        donorName: string;
        donorEmail: string;
        donorPhone?: string;
        donorPAN?: string;
        amount: number;
        purpose?: string;
        date: Date;
    }
): Promise<void> {
    const { jsPDF } = await import("jspdf");

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFillColor(30, 64, 175);
    pdf.rect(0, 0, pageWidth, 40, "F");

    // Organization name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("NIRASHRAY FOUNDATION", pageWidth / 2, 18, { align: "center" });
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Empowering Lives, Building Hope", pageWidth / 2, 27, { align: "center" });
    pdf.setFontSize(9);
    pdf.text("Registered under Societies Registration Act", pageWidth / 2, 35, { align: "center" });

    // Receipt title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("DONATION RECEIPT", pageWidth / 2, 55, { align: "center" });

    // Receipt number
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Receipt No: ${receiptData.receiptNumber}`, 20, 65);
    pdf.text(
        `Date: ${receiptData.date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
        pageWidth - 20,
        65,
        { align: "right" }
    );

    // Divider
    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(0.5);
    pdf.line(20, 70, pageWidth - 20, 70);

    // Donor details
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Donor Information", 20, 82);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    let y = 92;
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
    if (receiptData.purpose) addRow("Purpose", receiptData.purpose);

    // Donation amount box
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
    pdf.text(
        `₹${receiptData.amount.toLocaleString("en-IN")}`,
        pageWidth / 2 + 20,
        y + 14,
        { align: "center" }
    );

    // 80G note
    y += 40;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
        "This receipt is valid for claiming tax exemption under Section 80G of the Income Tax Act, 1961.",
        pageWidth / 2,
        y,
        { align: "center", maxWidth: pageWidth - 40 }
    );

    // Footer
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setDrawColor(30, 64, 175);
    pdf.setLineWidth(0.5);
    pdf.line(20, pageHeight - 40, pageWidth - 20, pageHeight - 40);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Authorized Signatory", 20, pageHeight - 28);
    pdf.text("Nirashray Foundation", 20, pageHeight - 20);

    pdf.text("Thank you for your generous contribution!", pageWidth / 2, pageHeight - 15, {
        align: "center",
    });

    pdf.save(`Receipt-${receiptData.receiptNumber}.pdf`);
}
