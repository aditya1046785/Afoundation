import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

interface IDCardIssuedProps {
    name: string;
    memberId: string;
    cardNumber: string;
    expiryDate: string;
}

export function IDCardIssuedEmail({ name, memberId, cardNumber, expiryDate }: IDCardIssuedProps) {
    return (
        <Html>
            <Head />
            <Preview>Your digital ID card is ready!</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Section style={headerStyle}>
                        <Heading style={titleStyle}>🪪 ID Card Issued!</Heading>
                    </Section>
                    <Section style={contentStyle}>
                        <Text style={greetingStyle}>Dear {name},</Text>
                        <Text style={textStyle}>
                            Your digital ID card has been issued successfully.
                        </Text>
                        <Section style={detailsBoxStyle}>
                            <Text style={detailLabel}>Member ID</Text>
                            <Text style={detailValue}>{memberId}</Text>
                            <Text style={detailLabel}>Card Number</Text>
                            <Text style={detailValue}>{cardNumber}</Text>
                            <Text style={detailLabel}>Expiry Date</Text>
                            <Text style={detailValue}>{expiryDate}</Text>
                        </Section>
                        <Text style={textStyle}>
                            You can view and download your ID card from your member dashboard.
                        </Text>
                        <Text style={footerTextStyle}>
                            Best regards,<br />
                            Nirashray Foundation Team
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const bodyStyle = { backgroundColor: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" };
const containerStyle = { maxWidth: "560px", margin: "0 auto", padding: "20px" };
const headerStyle = { backgroundColor: "#0f766e", padding: "32px", borderRadius: "12px 12px 0 0", textAlign: "center" as const };
const titleStyle = { color: "#fff", fontSize: "22px", fontWeight: "bold", margin: "0" };
const contentStyle = { backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 12px 12px" };
const greetingStyle = { fontSize: "16px", fontWeight: "600", color: "#1e293b" };
const textStyle = { fontSize: "14px", color: "#475569", lineHeight: "1.6" };
const detailsBoxStyle = { backgroundColor: "#f8fafc", borderRadius: "8px", padding: "20px", margin: "16px 0" };
const detailLabel = { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "10px 0 4px" };
const detailValue = { fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: "0" };
const footerTextStyle = { fontSize: "14px", color: "#64748b", marginTop: "24px" };

export default IDCardIssuedEmail;
