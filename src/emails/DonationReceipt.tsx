import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import { formatCurrency } from "@/lib/utils";

interface DonationReceiptProps {
    donorName: string;
    amount: number;
    receiptNumber: string;
    purpose: string;
    date: string;
    transactionId: string;
}

export function DonationReceiptEmail({
    donorName,
    amount,
    receiptNumber,
    purpose,
    date,
    transactionId,
}: DonationReceiptProps) {
    return (
        <Html>
            <Head />
            <Preview>Your donation receipt from Nirashray Foundation</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Section style={headerStyle}>
                        <Heading style={titleStyle}>Nirashray Foundation</Heading>
                        <Text style={subtitleStyle}>Donation Receipt</Text>
                    </Section>

                    <Section style={contentStyle}>
                        <Text style={greetingStyle}>Dear {donorName},</Text>
                        <Text style={textStyle}>
                            Thank you for your generous donation. Your contribution helps us create lasting positive change in communities.
                        </Text>

                        <Section style={detailsBoxStyle}>
                            <Text style={detailLabel}>Receipt Number</Text>
                            <Text style={detailValue}>{receiptNumber}</Text>
                            <Hr style={dividerStyle} />
                            <Text style={detailLabel}>Amount</Text>
                            <Text style={{ ...detailValue, fontSize: "24px", color: "#059669" }}>{formatCurrency(amount)}</Text>
                            <Hr style={dividerStyle} />
                            <Text style={detailLabel}>Purpose</Text>
                            <Text style={detailValue}>{purpose}</Text>
                            <Hr style={dividerStyle} />
                            <Text style={detailLabel}>Date</Text>
                            <Text style={detailValue}>{date}</Text>
                            <Hr style={dividerStyle} />
                            <Text style={detailLabel}>Transaction ID</Text>
                            <Text style={detailValue}>{transactionId}</Text>
                        </Section>

                        <Text style={textStyle}>
                            This receipt is eligible for tax exemption under Section 80G of the Income Tax Act.
                        </Text>

                        <Text style={footerTextStyle}>
                            With gratitude,<br />
                            Nirashray Foundation
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const bodyStyle = { backgroundColor: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" };
const containerStyle = { maxWidth: "560px", margin: "0 auto", padding: "20px" };
const headerStyle = { backgroundColor: "#1e3a8a", padding: "32px", borderRadius: "12px 12px 0 0", textAlign: "center" as const };
const titleStyle = { color: "#fff", fontSize: "24px", fontWeight: "bold", margin: "0" };
const subtitleStyle = { color: "#93c5fd", fontSize: "14px", margin: "4px 0 0" };
const contentStyle = { backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 12px 12px" };
const greetingStyle = { fontSize: "16px", fontWeight: "600", color: "#1e293b" };
const textStyle = { fontSize: "14px", color: "#475569", lineHeight: "1.6" };
const detailsBoxStyle = { backgroundColor: "#f8fafc", borderRadius: "8px", padding: "20px", margin: "16px 0" };
const detailLabel = { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0" };
const detailValue = { fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: "2px 0 8px" };
const dividerStyle = { borderColor: "#e2e8f0", margin: "8px 0" };
const footerTextStyle = { fontSize: "14px", color: "#64748b", marginTop: "24px" };

export default DonationReceiptEmail;
