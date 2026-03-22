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

interface WelcomeEmailProps {
    name: string;
    memberId: string;
    membershipType: string;
}

export function WelcomeEmail({ name, memberId, membershipType }: WelcomeEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Welcome to Nirashray Foundation!</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Section style={headerStyle}>
                        <Heading style={titleStyle}>🎉 Welcome to Nirashray Foundation!</Heading>
                    </Section>

                    <Section style={contentStyle}>
                        <Text style={greetingStyle}>Dear {name},</Text>
                        <Text style={textStyle}>
                            We&apos;re thrilled to have you as a member of the Nirashray Foundation family! Your membership application has been received and is being reviewed.
                        </Text>

                        <Section style={detailsBoxStyle}>
                            <Text style={detailLabel}>Your Member ID</Text>
                            <Text style={{ ...detailValue, fontSize: "20px", color: "#1e40af" }}>{memberId}</Text>
                            <Hr style={dividerStyle} />
                            <Text style={detailLabel}>Membership Type</Text>
                            <Text style={detailValue}>{membershipType}</Text>
                            <Hr style={dividerStyle} />
                            <Text style={detailLabel}>Status</Text>
                            <Text style={{ ...detailValue, color: "#f59e0b" }}>Pending Approval</Text>
                        </Section>

                        <Text style={textStyle}>
                            <strong>What happens next?</strong>
                        </Text>
                        <Text style={textStyle}>
                            Our team will review your application and you&apos;ll receive a notification once approved. This usually takes 1-3 business days.
                        </Text>
                        <Text style={textStyle}>
                            In the meantime, you can log in to your dashboard to track your membership status.
                        </Text>

                        <Text style={footerTextStyle}>
                            Together we make a difference,<br />
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
const headerStyle = { backgroundColor: "#1e3a8a", padding: "32px", borderRadius: "12px 12px 0 0", textAlign: "center" as const };
const titleStyle = { color: "#fff", fontSize: "22px", fontWeight: "bold", margin: "0" };
const contentStyle = { backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 12px 12px" };
const greetingStyle = { fontSize: "16px", fontWeight: "600", color: "#1e293b" };
const textStyle = { fontSize: "14px", color: "#475569", lineHeight: "1.6" };
const detailsBoxStyle = { backgroundColor: "#f8fafc", borderRadius: "8px", padding: "20px", margin: "16px 0" };
const detailLabel = { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.5px", margin: "0" };
const detailValue = { fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: "2px 0 8px" };
const dividerStyle = { borderColor: "#e2e8f0", margin: "8px 0" };
const footerTextStyle = { fontSize: "14px", color: "#64748b", marginTop: "24px" };

export default WelcomeEmail;
