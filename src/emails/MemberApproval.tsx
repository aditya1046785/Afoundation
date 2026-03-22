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

interface ApprovalEmailProps {
    name: string;
    memberId: string;
    approved: boolean;
    reason?: string;
}

export function MemberApprovalEmail({ name, memberId, approved, reason }: ApprovalEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>{approved ? "Your membership has been approved!" : "Membership application update"}</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Section style={{
                        ...headerStyle,
                        backgroundColor: approved ? "#059669" : "#dc2626"
                    }}>
                        <Heading style={titleStyle}>
                            {approved ? "✅ Membership Approved!" : "❌ Application Update"}
                        </Heading>
                    </Section>

                    <Section style={contentStyle}>
                        <Text style={greetingStyle}>Dear {name},</Text>

                        {approved ? (
                            <>
                                <Text style={textStyle}>
                                    Great news! Your membership application for Nirashray Foundation has been <strong>approved</strong>.
                                </Text>
                                <Text style={textStyle}>
                                    Your Member ID is: <strong>{memberId}</strong>
                                </Text>
                                <Text style={textStyle}>
                                    You now have full access to your member dashboard where you can:
                                </Text>
                                <Text style={textStyle}>
                                    • View and download your certificates<br />
                                    • Access your digital ID card<br />
                                    • Track your donations<br />
                                    • Update your profile
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={textStyle}>
                                    We regret to inform you that your membership application has not been approved at this time.
                                </Text>
                                {reason && (
                                    <Text style={{ ...textStyle, backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px" }}>
                                        <strong>Reason:</strong> {reason}
                                    </Text>
                                )}
                                <Text style={textStyle}>
                                    If you have any questions, please don&apos;t hesitate to contact us.
                                </Text>
                            </>
                        )}

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
const headerStyle = { padding: "32px", borderRadius: "12px 12px 0 0", textAlign: "center" as const };
const titleStyle = { color: "#fff", fontSize: "22px", fontWeight: "bold", margin: "0" };
const contentStyle = { backgroundColor: "#fff", padding: "32px", borderRadius: "0 0 12px 12px" };
const greetingStyle = { fontSize: "16px", fontWeight: "600", color: "#1e293b" };
const textStyle = { fontSize: "14px", color: "#475569", lineHeight: "1.6" };
const footerTextStyle = { fontSize: "14px", color: "#64748b", marginTop: "24px" };

export default MemberApprovalEmail;
