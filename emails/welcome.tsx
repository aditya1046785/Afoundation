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

interface WelcomeEmailProps {
    name: string;
    memberId: string;
}

export default function WelcomeEmail({ name, memberId }: WelcomeEmailProps) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return (
        <Html>
            <Head />
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    {/* Header */}
                    <Section style={headerStyle}>
                        <Heading style={orgNameStyle}>Nirashray Foundation</Heading>
                        <Text style={taglineStyle}>Empowering Lives, Building Hope</Text>
                    </Section>

                    {/* Body */}
                    <Section style={contentStyle}>
                        <Heading style={h2Style}>Welcome to our Family! 🎉</Heading>
                        <Text style={textStyle}>Dear {name},</Text>
                        <Text style={textStyle}>
                            We are thrilled to welcome you to the Nirashray Foundation community! Your
                            membership registration has been received successfully.
                        </Text>
                        <Text style={textStyle}>
                            <strong>Your Member ID:</strong> {memberId}
                        </Text>
                        <Text style={textStyle}>
                            Your membership is currently pending approval from our admin team. You will receive
                            another email once your membership has been approved. This usually takes 1-2 business
                            days.
                        </Text>
                        <Text style={textStyle}>
                            In the meanwhile, you can login to your dashboard to complete your profile.
                        </Text>

                        <Button href={`${appUrl}/login`} style={buttonStyle}>
                            Go to Dashboard
                        </Button>

                        <Hr style={hrStyle} />
                        <Text style={footerTextStyle}>
                            &quot;No one has ever become poor by giving.&quot; — Anne Frank
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footerStyle}>
                        <Text style={footerSmallStyle}>
                            This email was sent by Nirashray Foundation. If you did not register, please ignore
                            this email.
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
const buttonStyle = {
    backgroundColor: "#1E40AF", color: "#ffffff", fontWeight: "bold", padding: "14px 28px",
    borderRadius: "8px", textDecoration: "none", display: "inline-block",
};
const hrStyle = { borderColor: "#E5E7EB", margin: "32px 0" };
const footerTextStyle = { color: "#6B7280", fontSize: "14px", fontStyle: "italic", textAlign: "center" as const };
const footerStyle = { backgroundColor: "#F3F4F6", padding: "20px 40px", textAlign: "center" as const };
const footerSmallStyle = { color: "#9CA3AF", fontSize: "12px" };
