import {
    Html,
    Head,
    Body,
    Container,
    Text,
    Heading,
    Button,
    Hr,
    Section,
} from "@react-email/components";
import { format } from "date-fns";

interface DonationReceiptEmailProps {
    donorName: string;
    amount: number;
    receiptNumber: string;
    date: Date;
    purpose?: string;
}

export default function DonationReceiptEmail({
    donorName,
    amount,
    receiptNumber,
    date,
    purpose,
}: DonationReceiptEmailProps) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const formattedAmount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);

    return (
        <Html>
            <Head />
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Section style={headerStyle}>
                        <Heading style={orgNameStyle}>Nirashray Foundation</Heading>
                        <Text style={taglineStyle}>Empowering Lives, Building Hope</Text>
                    </Section>

                    <Section style={contentStyle}>
                        <Heading style={h2Style}>Thank You for Your Donation! 💙</Heading>
                        <Text style={textStyle}>Dear {donorName},</Text>
                        <Text style={textStyle}>
                            Your heartfelt contribution of <strong>{formattedAmount}</strong> has been received
                            successfully. Your generosity helps us make a real difference in the lives of those
                            who need it most.
                        </Text>

                        {/* Receipt box */}
                        <Section style={receiptBoxStyle}>
                            <Text style={receiptTitleStyle}>Donation Receipt</Text>
                            <Text style={receiptRowStyle}><strong>Receipt No:</strong> {receiptNumber}</Text>
                            <Text style={receiptRowStyle}><strong>Date:</strong> {format(date, "dd MMM yyyy")}</Text>
                            <Text style={receiptRowStyle}><strong>Amount:</strong> {formattedAmount}</Text>
                            {purpose && <Text style={receiptRowStyle}><strong>Purpose:</strong> {purpose}</Text>}
                        </Section>

                        <Text style={infoTextStyle}>
                            This receipt is valid for claiming tax exemption under Section 80G of the Income Tax Act, 1961.
                        </Text>

                        <Button href={`${appUrl}/member/donations`} style={buttonStyle}>
                            View Donation History
                        </Button>

                        <Hr style={hrStyle} />
                        <Text style={quoteStyle}>
                            &quot;No one has ever become poor by giving.&quot; — Anne Frank
                        </Text>
                    </Section>

                    <Section style={footerStyle}>
                        <Text style={footerSmallStyle}>
                            © 2025 Nirashray Foundation. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const bodyStyle = { backgroundColor: "#F8FAFC", fontFamily: "Inter, sans-serif" };
const containerStyle = { margin: "0 auto", maxWidth: "600px" };
const headerStyle = { backgroundColor: "#1E40AF", padding: "30px 40px", textAlign: "center" as const };
const orgNameStyle = { color: "#ffffff", fontSize: "24px", fontWeight: "bold", margin: "0" };
const taglineStyle = { color: "#93C5FD", fontSize: "14px", margin: "5px 0 0" };
const contentStyle = { backgroundColor: "#ffffff", padding: "40px" };
const h2Style = { color: "#1E40AF", fontSize: "22px", marginBottom: "24px" };
const textStyle = { color: "#374151", fontSize: "15px", lineHeight: "1.6", marginBottom: "16px" };
const receiptBoxStyle = { backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", padding: "20px", margin: "24px 0" };
const receiptTitleStyle = { color: "#1E40AF", fontSize: "16px", fontWeight: "bold", marginBottom: "12px" };
const receiptRowStyle = { color: "#374151", fontSize: "14px", margin: "6px 0" };
const infoTextStyle = { color: "#6B7280", fontSize: "13px", fontStyle: "italic", marginBottom: "24px" };
const buttonStyle = { backgroundColor: "#1E40AF", color: "#ffffff", fontWeight: "bold", padding: "14px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const hrStyle = { borderColor: "#E5E7EB", margin: "32px 0" };
const quoteStyle = { color: "#6B7280", fontSize: "14px", fontStyle: "italic", textAlign: "center" as const };
const footerStyle = { backgroundColor: "#F3F4F6", padding: "20px 40px", textAlign: "center" as const };
const footerSmallStyle = { color: "#9CA3AF", fontSize: "12px" };
