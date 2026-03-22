import { Html, Head, Body, Container, Text, Heading, Button, Section } from "@react-email/components";

interface MemberApprovedEmailProps {
    name: string;
    memberId: string;
}

export default function MemberApprovedEmail({ name, memberId }: MemberApprovedEmailProps) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return (
        <Html><Head />
            <Body style={{ backgroundColor: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
                <Container style={{ margin: "0 auto", maxWidth: "600px" }}>
                    <Section style={{ backgroundColor: "#10B981", padding: "30px 40px", textAlign: "center" }}>
                        <Heading style={{ color: "#ffffff", fontSize: "24px", margin: "0" }}>Nirashray Foundation</Heading>
                        <Text style={{ color: "#A7F3D0", fontSize: "14px", margin: "5px 0 0" }}>Empowering Lives, Building Hope</Text>
                    </Section>
                    <Section style={{ backgroundColor: "#ffffff", padding: "40px" }}>
                        <Heading style={{ color: "#10B981", fontSize: "22px" }}>Congratulations! Your Membership is Approved ✅</Heading>
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>Dear {name},</Text>
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6", marginBottom: "16px" }}>
                            We are delighted to inform you that your membership with Nirashray Foundation has been <strong>approved</strong>! Welcome officially to our family.
                        </Text>
                        <Text style={{ color: "#374151", fontSize: "15px" }}><strong>Your Member ID:</strong> {memberId}</Text>
                        <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6" }}>You can now access your dashboard, download your ID card, and view all your membership benefits.</Text>
                        <Button href={`${appUrl}/member`} style={{ backgroundColor: "#10B981", color: "#ffffff", fontWeight: "bold", padding: "14px 28px", borderRadius: "8px", textDecoration: "none", display: "inline-block" }}>
                            Go to Dashboard
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
