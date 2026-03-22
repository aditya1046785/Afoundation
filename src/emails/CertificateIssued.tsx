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

interface CertificateIssuedProps {
    name: string;
    certificateType: string;
    certificateNo: string;
}

export function CertificateIssuedEmail({ name, certificateType, certificateNo }: CertificateIssuedProps) {
    return (
        <Html>
            <Head />
            <Preview>Your {certificateType} certificate is ready!</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Section style={headerStyle}>
                        <Heading style={titleStyle}>🏆 Certificate Issued!</Heading>
                    </Section>
                    <Section style={contentStyle}>
                        <Text style={greetingStyle}>Dear {name},</Text>
                        <Text style={textStyle}>
                            We are pleased to inform you that your <strong>{certificateType}</strong> certificate has been issued.
                        </Text>
                        <Section style={detailsBoxStyle}>
                            <Text style={detailLabel}>Certificate Number</Text>
                            <Text style={{ ...detailValue, color: "#1e40af" }}>{certificateNo}</Text>
                        </Section>
                        <Text style={textStyle}>
                            You can view and download your certificate from your member dashboard.
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
const headerStyle = { backgroundColor: "#059669", padding: "32px", borderRadius: "12px 12px 0 0", textAlign: "center" as const };
const titleStyle = { color: "#fff", fontSize: "22px", fontWeight: "bold", margin: "0" };
const contentStyle = { backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 12px 12px" };
const greetingStyle = { fontSize: "16px", fontWeight: "600", color: "#1e293b" };
const textStyle = { fontSize: "14px", color: "#475569", lineHeight: "1.6" };
const detailsBoxStyle = { backgroundColor: "#f8fafc", borderRadius: "8px", padding: "20px", margin: "16px 0" };
const detailLabel = { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0" };
const detailValue = { fontSize: "20px", fontWeight: "600", color: "#1e293b", margin: "4px 0" };
const footerTextStyle = { fontSize: "14px", color: "#64748b", marginTop: "24px" };

export default CertificateIssuedEmail;
