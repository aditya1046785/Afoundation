/**
 * PDF generation utilities using html2canvas + jsPDF
 * All PDF generation is done client-side
 */

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
