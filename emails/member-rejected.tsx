import { Html, Head, Body, Container, Text, Heading, Section } from "@react-email/components";

interface MemberRejectedEmailProps {
    name: string;
    reason: string;
}

export default function MemberRejectedEmail({ name, reason }: MemberRejectedEmailProps) {
    return (
        <Html><Head />
            <Body style={{ backgroundColor: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
                <Container style={{ margin: "0 auto", maxWidth: "600px" }}>
                    <Section style={{ backgroundColor: "#1E40AF", padding: "30px 40px", textAlign: "center" }}>
                        <Heading style={{ color: "#ffffff", fontSize: "24px", margin: "0" }}>Nirashray Foundation</Heading>
                        <Text style={{ color: "#93C5FD", fontSize: "14px", margin: "5px 0 0" }}>Empowering Lives, Building Hope</Text>
                    </Section>
                    <Section style={{ backgroundColor: "#ffffff", padding: "40px" }}>
                        <Heading style={{ color: "#374151", fontSize: "22px" }}>Application Status Update</Heading>
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>Dear {name},</Text>
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>
                            Thank you for your interest in joining Nirashray Foundation. After reviewing your application, we regret to inform you that we are unable to approve your membership at this time.
                        </Text>
                        {reason && (
                            <Section style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "16px", margin: "16px 0" }}>
                                <Text style={{ color: "#991B1B", fontSize: "14px", fontWeight: "bold", margin: "0 0 8px" }}>Reason:</Text>
                                <Text style={{ color: "#374151", fontSize: "14px", margin: "0" }}>{reason}</Text>
                            </Section>
                        )}
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>
                            If you have any questions or would like to appeal this decision, please contact us at <strong>info@nirashray.org</strong>.
                        </Text>
                        <Text style={{ color: "#374151", fontSize: "15px" }}>We hope to welcome you in the future.</Text>
                        <Text style={{ color: "#374151", fontSize: "15px" }}>Warm regards,<br /><strong>Nirashray Foundation Team</strong></Text>
                    </Section>
                    <Section style={{ backgroundColor: "#F3F4F6", padding: "20px 40px", textAlign: "center" }}>
                        <Text style={{ color: "#9CA3AF", fontSize: "12px" }}>© 2025 Nirashray Foundation. All rights reserved.</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
