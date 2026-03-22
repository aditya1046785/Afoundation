import { Html, Head, Body, Container, Text, Heading, Button, Section } from "@react-email/components";

interface CertificateIssuedEmailProps {
    name: string;
    certificateType: string;
    certificateNo: string;
}

export default function CertificateIssuedEmail({ name, certificateType, certificateNo }: CertificateIssuedEmailProps) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return (
        <Html><Head />
            <Body style={{ backgroundColor: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
                <Container style={{ margin: "0 auto", maxWidth: "600px" }}>
                    <Section style={{ backgroundColor: "#1E40AF", padding: "30px 40px", textAlign: "center" }}>
                        <Heading style={{ color: "#ffffff", fontSize: "24px", margin: "0" }}>Nirashray Foundation</Heading>
                        <Text style={{ color: "#93C5FD", fontSize: "14px", margin: "5px 0 0" }}>Empowering Lives, Building Hope</Text>
                    </Section>
                    <Section style={{ backgroundColor: "#ffffff", padding: "40px" }}>
                        <Heading style={{ color: "#1E40AF", fontSize: "22px" }}>Your {certificateType} is Ready! 🏆</Heading>
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>Dear {name},</Text>
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>
                            We are pleased to inform you that your <strong>{certificateType}</strong> has been issued and is now available in your dashboard.
                        </Text>
                        <Text style={{ color: "#374151", fontSize: "15px" }}><strong>Certificate No:</strong> {certificateNo}</Text>
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>You can login to your dashboard to view and download your certificate.</Text>
                        <Button href={`${appUrl}/member/certificates`} style={{ backgroundColor: "#F59E0B", color: "#ffffff", fontWeight: "bold", padding: "14px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" }}>
                            Download Certificate
                        </Button>
                    </Section>
                    <Section style={{ backgroundColor: "#F3F4F6", padding: "20px 40px", textAlign: "center" }}>
                        <Text style={{ color: "#9CA3AF", fontSize: "12px" }}>© 2025 Nirashray Foundation. All rights reserved.</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
